"""
Views for hospitals app.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
from geopy.distance import geodesic
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
import logging

from .models import Hospital, Department, HospitalDoctorProfile
from .serializers import (
    HospitalSerializer, HospitalRegistrationSerializer, HospitalApprovalSerializer,
    DepartmentSerializer, HospitalDoctorProfileSerializer, CreateDoctorSerializer,
    NearbyHospitalSerializer, HospitalApprovalResponseSerializer,
    CreateDoctorResponseSerializer, NearbyHospitalsResponseSerializer
)
from accounts.utils import log_action
from .permissions import IsHospitalUser, IsAdminUser, IsDoctorUser

logger = logging.getLogger(__name__)


class HospitalRegistrationView(generics.CreateAPIView):
    """
    Hospital registration endpoint.
    POST /api/hospitals/register/
    """
    serializer_class = HospitalRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        hospital = serializer.save()
        
        # Log the registration
        log_action(
            action='USER_CREATED',
            user=hospital.user,
            performed_by=hospital.user,
            details={
                'user_type': 'HOSPITAL',
                'hospital_name': hospital.name,
                'license_number': hospital.license_number
            },
            request=request
        )
        
        return Response(
            {
                'message': 'Hospital registered successfully. Awaiting admin approval.',
                'hospital': HospitalSerializer(hospital).data
            },
            status=status.HTTP_201_CREATED
        )


class HospitalListView(generics.ListAPIView):
    """
    List hospitals (Admin can see all, others see only approved).
    GET /api/hospitals/
    """
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'ADMIN':
            # Admin sees all hospitals
            queryset = Hospital.objects.all()
            
            # Filter by approval status if provided
            is_approved = self.request.query_params.get('is_approved')
            if is_approved is not None:
                queryset = queryset.filter(is_approved=is_approved.lower() == 'true')
        else:
            # Others see only approved hospitals
            queryset = Hospital.objects.filter(is_approved=True)
        
        return queryset.order_by('-created_at')


class HospitalDetailView(generics.RetrieveUpdateAPIView):
    """
    Get or update hospital details.
    GET/PUT/PATCH /api/hospitals/{id}/
    """
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'ADMIN':
            return Hospital.objects.all()
        elif user.user_type == 'HOSPITAL':
            return Hospital.objects.filter(user=user)
        else:
            return Hospital.objects.filter(is_approved=True)


class HospitalApprovalView(APIView):
    """
    Approve or reject hospital (Admin only).
    PATCH /api/hospitals/{id}/approve/
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    @extend_schema(
        request=HospitalApprovalSerializer,
        responses={200: HospitalApprovalResponseSerializer}
    )
    def patch(self, request, pk):
        try:
            hospital = Hospital.objects.get(pk=pk)
        except Hospital.DoesNotExist:
            return Response(
                {'error': 'Hospital not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = HospitalApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        is_approved = serializer.validated_data['is_approved']
        
        hospital.is_approved = is_approved
        hospital.approved_by = request.user if is_approved else None
        hospital.approved_at = timezone.now() if is_approved else None
        hospital.save()
        
        # Activate/deactivate hospital user account
        hospital.user.is_active = is_approved
        hospital.user.save()
        
        # Log the action
        log_action(
            action='HOSPITAL_APPROVED' if is_approved else 'USER_UPDATED',
            user=hospital.user,
            performed_by=request.user,
            details={
                'hospital_id': hospital.id,
                'hospital_name': hospital.name,
                'is_approved': is_approved
            },
            request=request
        )
        
        return Response({
            'message': f"Hospital {'approved' if is_approved else 'rejected'} successfully",
            'hospital': HospitalSerializer(hospital).data
        })


class DepartmentListCreateView(generics.ListCreateAPIView):
    """
    List or create departments.
    GET/POST /api/hospitals/departments/
    """
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        hospital_id = self.request.query_params.get('hospital_id')
        
        if user.user_type == 'HOSPITAL':
            try:
                hospital = Hospital.objects.get(user=user)
                return Department.objects.filter(hospital=hospital)
            except Hospital.DoesNotExist:
                return Department.objects.none()
        elif hospital_id:
            return Department.objects.filter(hospital_id=hospital_id, hospital__is_approved=True)
        else:
            return Department.objects.filter(hospital__is_approved=True)
    
    def get_serializer_context(self):
        """Add request to serializer context."""
        context = super().get_serializer_context()
        return context
    
    def perform_create(self, serializer):
        """Ensure hospital user can only create departments for their hospital."""
        user = self.request.user
        
        if user.user_type == 'HOSPITAL':
            try:
                hospital = Hospital.objects.get(user=user)
                serializer.save(hospital=hospital)
            except Hospital.DoesNotExist:
                raise permissions.PermissionDenied("Hospital profile not found")
        else:
            raise permissions.PermissionDenied("Only hospitals can create departments")

class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a department.
    GET/PUT/PATCH/DELETE /api/hospitals/departments/{id}/
    """
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'HOSPITAL':
            try:
                hospital = Hospital.objects.get(user=user)
                return Department.objects.filter(hospital=hospital)
            except Hospital.DoesNotExist:
                return Department.objects.none()
        elif user.user_type == 'ADMIN':
            return Department.objects.all()
        else:
            return Department.objects.filter(hospital__is_approved=True)


# Find CreateDoctorView and update it:

class CreateDoctorView(APIView):
    """
    Create a doctor account (Hospital only).
    POST /api/hospitals/doctors/create/
    """
    permission_classes = [permissions.IsAuthenticated, IsHospitalUser]
    
    def post(self, request):
        # 👇 DEBUG: Print received data
        print("=" * 60)
        print("📥 RECEIVED DATA:", request.data)
        print("=" * 60)
        
        # Get hospital
        try:
            hospital = Hospital.objects.get(user=request.user)
            print("✅ Hospital found:", hospital.name)
        except Hospital.DoesNotExist:
            print("❌ Hospital not found for user:", request.user)
            return Response(
                {'error': 'Hospital profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not hospital.is_approved:
            print("❌ Hospital not approved")
            return Response(
                {'error': 'Hospital must be approved before creating doctors'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CreateDoctorSerializer(
            data=request.data,
            context={'hospital': hospital, 'request': request}
        )
        
        # 👇 DEBUG: Print validation result
        if not serializer.is_valid():
            print("❌ VALIDATION ERRORS:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        print("✅ Validation passed")
        
        try:
            profile, password = serializer.save()
            print("✅ Doctor created:", profile.user.username)
        except Exception as e:
            print("❌ CREATE ERROR:", str(e))
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'message': 'Doctor account created successfully',
            'username': profile.user.username,
            'password': password,
        }, status=status.HTTP_201_CREATED)

class HospitalDoctorListView(generics.ListAPIView):
    """
    List doctors for a hospital.
    GET /api/hospitals/doctors/
    """
    serializer_class = HospitalDoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        hospital_id = self.request.query_params.get('hospital_id')
        
        if user.user_type == 'HOSPITAL':
            # Hospital sees only their doctors
            try:
                hospital = Hospital.objects.get(user=user)
                return HospitalDoctorProfile.objects.filter(hospital=hospital)
            except Hospital.DoesNotExist:
                return HospitalDoctorProfile.objects.none()
        elif hospital_id:
            return HospitalDoctorProfile.objects.filter(
                hospital_id=hospital_id,
                hospital__is_approved=True,
                is_active=True
            )
        else:
            return HospitalDoctorProfile.objects.filter(
                hospital__is_approved=True,
                is_active=True
            )


class HospitalDoctorDetailView(generics.RetrieveUpdateAPIView):
    """
    Get or update doctor profile.
    GET/PUT/PATCH /api/hospitals/doctors/{id}/
    """
    serializer_class = HospitalDoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'HOSPITAL':
            try:
                hospital = Hospital.objects.get(user=user)
                return HospitalDoctorProfile.objects.filter(hospital=hospital)
            except Hospital.DoesNotExist:
                return HospitalDoctorProfile.objects.none()
        elif user.user_type == 'DOCTOR':
            return HospitalDoctorProfile.objects.filter(user=user)
        else:
            return HospitalDoctorProfile.objects.filter(hospital__is_approved=True)


class NearbyHospitalsView(APIView):
    """
    Find nearby hospitals based on coordinates.
    GET /api/hospitals/nearby/?lat=&lng=&radius_km=
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        parameters=[
            OpenApiParameter(name='lat', type=OpenApiTypes.FLOAT, location=OpenApiParameter.QUERY, required=True),
            OpenApiParameter(name='lng', type=OpenApiTypes.FLOAT, location=OpenApiParameter.QUERY, required=True),
            OpenApiParameter(name='radius_km', type=OpenApiTypes.FLOAT, location=OpenApiParameter.QUERY, required=False, default=10),
        ],
        responses={200: NearbyHospitalsResponseSerializer}
    )
    def get(self, request):
        try:
            lat = float(request.query_params.get('lat'))
            lng = float(request.query_params.get('lng'))
            radius_km = float(request.query_params.get('radius_km', 10))
        except (TypeError, ValueError):
            return Response(
                {'error': 'Invalid coordinates. Provide lat, lng, and optional radius_km'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_location = (lat, lng)
        
        # Get approved hospitals with coordinates
        hospitals = Hospital.objects.filter(
            is_approved=True,
            latitude__isnull=False,
            longitude__isnull=False
        )
        
        # Calculate distances
        nearby_hospitals = []
        for hospital in hospitals:
            hospital_location = (float(hospital.latitude), float(hospital.longitude))
            distance = geodesic(user_location, hospital_location).kilometers
            
            if distance <= radius_km:
                hospital.distance_km = round(distance, 2)
                nearby_hospitals.append(hospital)
        
        # Sort by distance
        nearby_hospitals.sort(key=lambda h: h.distance_km)
        
        serializer = NearbyHospitalSerializer(nearby_hospitals, many=True)
        return Response({
            'count': len(nearby_hospitals),
            'radius_km': radius_km,
            'hospitals': serializer.data
        })
