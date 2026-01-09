"""
Views for accounts app.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import update_session_auth_hash
from django.utils import timezone
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from drf_spectacular.utils import extend_schema, OpenApiParameter
import logging

from .models import User, OTP
from .serializers import (
    UserSerializer, PatientRegistrationSerializer,
    OTPGenerateSerializer, OTPVerifySerializer,
    ChangePasswordSerializer, AuditLogSerializer,
    ChangePasswordResponseSerializer, OTPGenerateResponseSerializer,
    OTPVerifyResponseSerializer, DashboardStatsSerializer
)
from .utils import send_sms, log_action, get_client_ip

logger = logging.getLogger(__name__)


class PatientRegistrationView(generics.CreateAPIView):
    """
    Patient self-registration endpoint.
    POST /api/accounts/patients/register/
    """
    serializer_class = PatientRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Log the registration
        log_action(
            action='USER_CREATED',
            user=user,
            performed_by=user,
            details={'user_type': 'PATIENT'},
            request=request
        )
        
        return Response(
            {
                'message': 'Patient registered successfully',
                'user': UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    Get or update current authenticated user.
    GET/PUT/PATCH /api/accounts/me/
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """
    Change password for authenticated user.
    POST /api/accounts/change-password/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        request=ChangePasswordSerializer,
        responses={200: ChangePasswordResponseSerializer}
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Update session to prevent logout
        update_session_auth_hash(request, user)
        
        # Log the action
        log_action(
            action='USER_UPDATED',
            user=user,
            performed_by=user,
            details={'action': 'password_changed'},
            request=request
        )
        
        return Response({'message': 'Password changed successfully'})


@method_decorator(ratelimit(key='ip', rate='3/15m', method='POST'), name='dispatch')
class OTPGenerateView(APIView):
    """
    Generate OTP for patient repository access.
    POST /api/accounts/otp/generate/
    
    Rate limited: 3 requests per 15 minutes per IP
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        request=OTPGenerateSerializer,
        responses={200: OTPGenerateResponseSerializer}
    )
    def post(self, request):
        serializer = OTPGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone_number = serializer.validated_data['patient_phone']
        patient_id = serializer.validated_data.get('patient_id')
        
        # Find patient by phone number or ID
        try:
            if patient_id:
                patient = User.objects.get(id=patient_id, user_type='PATIENT')
            else:
                patient = User.objects.get(phone_number=phone_number, user_type='PATIENT')
        except User.DoesNotExist:
            return Response(
                {'error': 'Patient not found with provided details'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify phone number matches
        if patient.phone_number != phone_number:
            return Response(
                {'error': 'Phone number does not match patient record'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create OTP
        otp_instance, plain_code = OTP.create_otp(
            user=patient,
            phone_number=phone_number,
            requested_by=request.user
        )

        # Log the action (no sms_sent)
        log_action(
            action='OTP_REQUESTED',
            user=patient,
            performed_by=request.user,
            details={
                'phone_number': phone_number,
                'otp_id': otp_instance.id
            },
            request=request
        )

        # Return OTP in response for dashboard display
        return Response({
            'message': 'OTP generated successfully',
            'otp': plain_code,
            'expires_at': otp_instance.expires_at,
            'phone_number': phone_number[-4:]  # Only show last 4 digits
        })


class OTPVerifyView(APIView):
    """
    Verify OTP and grant access to patient repository.
    POST /api/accounts/otp/verify/
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    @extend_schema(
        request=OTPVerifySerializer,
        responses={200: OTPVerifyResponseSerializer}
    )
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone_number = serializer.validated_data['patient_phone']
        otp_code = serializer.validated_data['otp']
        
        # Find the most recent valid OTP for this phone number
        try:
            otp = OTP.objects.filter(
                phone_number=phone_number,
                is_used=False,
                expires_at__gt=timezone.now()
            ).order_by('-created_at').first()
            
            if not otp:
                return Response(
                    {'error': 'No valid OTP found or OTP has expired'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify the code
            if not otp.verify_code(otp_code):
                return Response(
                    {'error': 'Invalid OTP code'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mark OTP as used
            otp.mark_as_used()
            
            # Log the action
            log_action(
                action='OTP_VERIFIED',
                user=otp.user,
                performed_by=request.user,
                details={
                    'phone_number': phone_number,
                    'otp_id': otp.id
                },
                request=request
            )
            
            # Generate a short-lived access token (you can use JWT or session)
            # For simplicity, we'll return patient ID and verification status
            return Response({
                'message': 'OTP verified successfully',
                'patient_id': otp.user.id,
                'verified': True,
                'access_granted_until': timezone.now() + timezone.timedelta(minutes=30)
            })
            
        except Exception as e:
            logger.error(f"OTP verification error: {str(e)}")
            return Response(
                {'error': 'OTP verification failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserListView(generics.ListAPIView):
    """
    List users (Admin only).
    GET /api/accounts/users/
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Only admin can list all users
        if user.user_type != 'ADMIN':
            return User.objects.filter(id=user.id)
        
        # Filter by user type if provided
        user_type = self.request.query_params.get('user_type')
        queryset = User.objects.all()
        
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        
        return queryset.order_by('-date_joined')


@extend_schema(
    responses={200: DashboardStatsSerializer}
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics (Admin only).
    GET /api/accounts/dashboard-stats/
    """
    user = request.user
    
    if user.user_type != 'ADMIN':
        return Response(
            {'error': 'Only admins can access dashboard statistics'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from hospitals.models import Hospital, HospitalDoctorProfile
    from appointments.models import Appointment
    
    stats = {
        'total_users': User.objects.count(),
        'total_patients': User.objects.filter(user_type='PATIENT').count(),
        'total_doctors': User.objects.filter(user_type='DOCTOR').count(),
        'total_hospitals': Hospital.objects.count(),
        'approved_hospitals': Hospital.objects.filter(is_approved=True).count(),
        'pending_hospitals': Hospital.objects.filter(is_approved=False).count(),
        'total_appointments': Appointment.objects.count(),
        'pending_appointments': Appointment.objects.filter(status='REQUESTED').count(),
    }
    
    return Response(stats)
