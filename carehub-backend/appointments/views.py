"""
Views for appointments app.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
from drf_spectacular.utils import extend_schema
import logging

from .models import Appointment
from .serializers import (
    AppointmentSerializer, CreateAppointmentSerializer,
    AssignDoctorSerializer, UpdateAppointmentStatusSerializer,
    DoctorAppointmentSerializer, AppointmentResponseSerializer
)
from hospitals.models import Hospital, HospitalDoctorProfile
from hospitals.permissions import IsHospitalUser, IsDoctorUser, IsPatientUser

logger = logging.getLogger(__name__)


class CreateAppointmentView(generics.CreateAPIView):
    """
    Create appointment (Patient only).
    POST /api/appointments/
    """
    serializer_class = CreateAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()
        
        return Response(
            {
                'message': 'Appointment request created successfully',
                'appointment': AppointmentSerializer(appointment).data
            },
            status=status.HTTP_201_CREATED
        )


class PatientAppointmentListView(generics.ListAPIView):
    """
    List patient's appointments.
    GET /api/appointments/my-appointments/
    """
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]
    
    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user).order_by('-requested_time')


class HospitalAppointmentListView(generics.ListAPIView):
    """
    List hospital's appointments.
    GET /api/appointments/hospital-appointments/
    """
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalUser]
    
    def get_queryset(self):
        try:
            hospital = Hospital.objects.get(user=self.request.user)
            queryset = Appointment.objects.filter(hospital=hospital)
            
            # Filter by status if provided
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            return queryset.order_by('-requested_time')
        except Hospital.DoesNotExist:
            return Appointment.objects.none()


class DoctorAppointmentListView(generics.ListAPIView):
    """
    List doctor's assigned appointments.
    GET /api/appointments/doctor-appointments/
    """
    serializer_class = DoctorAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]
    
    def get_queryset(self):
        # Get all doctor profiles for this user
        doctor_profiles = HospitalDoctorProfile.objects.filter(user=self.request.user)
        
        queryset = Appointment.objects.filter(assigned_doctor__in=doctor_profiles)
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-requested_time')


class AppointmentDetailView(generics.RetrieveAPIView):
    """
    Get appointment details.
    GET /api/appointments/{id}/
    """
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'PATIENT':
            return Appointment.objects.filter(patient=user)
        elif user.user_type == 'HOSPITAL':
            try:
                hospital = Hospital.objects.get(user=user)
                return Appointment.objects.filter(hospital=hospital)
            except Hospital.DoesNotExist:
                return Appointment.objects.none()
        elif user.user_type == 'DOCTOR':
            doctor_profiles = HospitalDoctorProfile.objects.filter(user=user)
            return Appointment.objects.filter(assigned_doctor__in=doctor_profiles)
        elif user.user_type == 'ADMIN':
            return Appointment.objects.all()
        
        return Appointment.objects.none()


class AssignDoctorView(APIView):
    """
    Assign doctor to appointment (Hospital only).
    POST /api/appointments/{id}/assign-doctor/
    """
    permission_classes = [permissions.IsAuthenticated, IsHospitalUser]
    
    @extend_schema(
        request=AssignDoctorSerializer,
        responses={200: AppointmentResponseSerializer}
    )
    def post(self, request, pk):
        # Get hospital
        try:
            hospital = Hospital.objects.get(user=request.user)
        except Hospital.DoesNotExist:
            return Response(
                {'error': 'Hospital profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get appointment
        try:
            appointment = Appointment.objects.get(pk=pk, hospital=hospital)
        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate appointment can be assigned
        if not appointment.can_be_assigned():
            return Response(
                {'error': 'Appointment cannot be assigned. It may already have a doctor or is not in REQUESTED status.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AssignDoctorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        doctor_id = serializer.validated_data['doctor_id']
        
        # Get doctor profile
        try:
            doctor_profile = HospitalDoctorProfile.objects.get(
                id=doctor_id,
                hospital=hospital,
                is_active=True
            )
        except HospitalDoctorProfile.DoesNotExist:
            return Response(
                {'error': 'Doctor not found in your hospital or is inactive'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify doctor is in the same department
        if appointment.department not in doctor_profile.hospital.departments.all():
            logger.warning(f"Doctor {doctor_profile.id} assigned to appointment in different department")
        
        # Assign doctor
        appointment.assigned_doctor = doctor_profile
        appointment.assigned_by = request.user
        appointment.assigned_at = timezone.now()
        
        if serializer.validated_data.get('confirmed_time'):
            appointment.confirmed_time = serializer.validated_data['confirmed_time']
            appointment.status = 'CONFIRMED'
        
        if serializer.validated_data.get('notes'):
            appointment.notes = serializer.validated_data['notes']
        
        appointment.save()
        
        return Response({
            'message': 'Doctor assigned successfully',
            'appointment': AppointmentSerializer(appointment).data
        })


class UpdateAppointmentStatusView(APIView):
    """
    Update appointment status.
    PATCH /api/appointments/{id}/status/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        request=UpdateAppointmentStatusSerializer,
        responses={200: AppointmentResponseSerializer}
    )
    def patch(self, request, pk):
        user = request.user
        
        # Get appointment based on user type
        try:
            if user.user_type == 'HOSPITAL':
                hospital = Hospital.objects.get(user=user)
                appointment = Appointment.objects.get(pk=pk, hospital=hospital)
            elif user.user_type == 'DOCTOR':
                doctor_profiles = HospitalDoctorProfile.objects.filter(user=user)
                appointment = Appointment.objects.get(pk=pk, assigned_doctor__in=doctor_profiles)
            elif user.user_type == 'PATIENT':
                appointment = Appointment.objects.get(pk=pk, patient=user)
            else:
                return Response(
                    {'error': 'You do not have permission to update this appointment'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except (Appointment.DoesNotExist, Hospital.DoesNotExist):
            return Response(
                {'error': 'Appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = UpdateAppointmentStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_status = serializer.validated_data['status']
        
        # Validate status transitions
        if user.user_type == 'PATIENT' and new_status != 'CANCELLED':
            return Response(
                {'error': 'Patients can only cancel appointments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        appointment.status = new_status
        
        if serializer.validated_data.get('notes'):
            appointment.notes = serializer.validated_data['notes']
        
        appointment.save()
        
        return Response({
            'message': f'Appointment status updated to {new_status}',
            'appointment': AppointmentSerializer(appointment).data
        })


class CancelAppointmentView(APIView):
    """
    Cancel appointment (Patient or Hospital).
    POST /api/appointments/{id}/cancel/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        request=None,
        responses={200: AppointmentResponseSerializer}
    )
    def post(self, request, pk):
        user = request.user
        
        try:
            if user.user_type == 'PATIENT':
                appointment = Appointment.objects.get(pk=pk, patient=user)
            elif user.user_type == 'HOSPITAL':
                hospital = Hospital.objects.get(user=user)
                appointment = Appointment.objects.get(pk=pk, hospital=hospital)
            else:
                return Response(
                    {'error': 'Only patients and hospitals can cancel appointments'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except (Appointment.DoesNotExist, Hospital.DoesNotExist):
            return Response(
                {'error': 'Appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if appointment.status == 'COMPLETED':
            return Response(
                {'error': 'Cannot cancel completed appointment'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'CANCELLED'
        
        if request.data.get('notes'):
            appointment.notes = request.data['notes']
        
        appointment.save()
        
        return Response({
            'message': 'Appointment cancelled successfully',
            'appointment': AppointmentSerializer(appointment).data
        })
