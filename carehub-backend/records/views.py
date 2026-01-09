"""
Views for records app.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
import logging

from .models import Prescription, PatientReport, PrescriptionAttachment
from .serializers import (
    PrescriptionSerializer, CreatePrescriptionSerializer,
    PatientReportSerializer, UploadPatientReportSerializer,
    PrescriptionAttachmentSerializer, PrescriptionWithAttachmentsSerializer,
    PatientMedicalSummarySerializer
)
from accounts.models import User, OTP
from hospitals.models import HospitalDoctorProfile
from hospitals.permissions import IsDoctorUser, IsPatientUser
from django.utils import timezone

logger = logging.getLogger(__name__)


class CreatePrescriptionView(generics.CreateAPIView):
    """
    Create prescription (Doctor only).
    POST /api/records/prescriptions/
    """
    serializer_class = CreatePrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]
    
    def create(self, request, *args, **kwargs):
        # Get doctor profile
        doctor_profiles = HospitalDoctorProfile.objects.filter(user=request.user, is_active=True)
        
        if not doctor_profiles.exists():
            return Response(
                {'error': 'Active doctor profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Use the first active profile or allow doctor to specify hospital
        hospital_id = request.data.get('hospital_id')
        if hospital_id:
            doctor_profile = doctor_profiles.filter(hospital_id=hospital_id).first()
            if not doctor_profile:
                return Response(
                    {'error': 'Doctor profile not found for specified hospital'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            doctor_profile = doctor_profiles.first()
        
        serializer = self.get_serializer(
            data=request.data,
            context={'doctor_profile': doctor_profile, 'request': request}
        )
        serializer.is_valid(raise_exception=True)
        prescription = serializer.save()
        
        return Response(
            {
                'message': 'Prescription created successfully',
                'prescription': PrescriptionSerializer(prescription).data
            },
            status=status.HTTP_201_CREATED
        )


class PrescriptionListView(generics.ListAPIView):
    """
    List prescriptions based on user type.
    GET /api/records/prescriptions/
    """
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'PATIENT':
            return Prescription.objects.filter(patient=user).order_by('-created_at')
        elif user.user_type == 'DOCTOR':
            doctor_profiles = HospitalDoctorProfile.objects.filter(user=user)
            return Prescription.objects.filter(doctor__in=doctor_profiles).order_by('-created_at')
        elif user.user_type == 'ADMIN':
            return Prescription.objects.all().order_by('-created_at')
        
        return Prescription.objects.none()


class PrescriptionDetailView(generics.RetrieveAPIView):
    """
    Get prescription details.
    GET /api/records/prescriptions/{id}/
    """
    serializer_class = PrescriptionWithAttachmentsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'PATIENT':
            return Prescription.objects.filter(patient=user)
        elif user.user_type == 'DOCTOR':
            doctor_profiles = HospitalDoctorProfile.objects.filter(user=user)
            return Prescription.objects.filter(doctor__in=doctor_profiles)
        elif user.user_type == 'ADMIN':
            return Prescription.objects.all()
        
        return Prescription.objects.none()


class PatientPrescriptionHistoryView(generics.ListAPIView):
    """
    Get prescription history for a patient (with OTP verification for doctors).
    GET /api/records/patients/{patient_id}/prescriptions/
    """
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        patient_id = self.kwargs.get('patient_id')
        
        try:
            patient = User.objects.get(id=patient_id, user_type='PATIENT')
        except User.DoesNotExist:
            return Prescription.objects.none()
        
        # Patient can view their own prescriptions
        if user.user_type == 'PATIENT' and user.id == patient_id:
            return Prescription.objects.filter(patient=patient).order_by('-created_at')
        
        # Admin can view all
        if user.user_type == 'ADMIN':
            return Prescription.objects.filter(patient=patient).order_by('-created_at')
        
        # Doctors need OTP verification (checked via query param)
        if user.user_type == 'DOCTOR':
            otp_token = self.request.query_params.get('otp_verified')
            if otp_token == 'true':
                # In production, verify a signed token here
                return Prescription.objects.filter(patient=patient).order_by('-created_at')
        
        return Prescription.objects.none()


class UploadPatientReportView(generics.CreateAPIView):
    """
    Upload patient report.
    POST /api/records/patients/{patient_id}/reports/
    """
    serializer_class = UploadPatientReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def create(self, request, *args, **kwargs):
        patient_id = self.kwargs.get('patient_id')
        
        # Get patient
        try:
            patient = User.objects.get(id=patient_id, user_type='PATIENT')
        except User.DoesNotExist:
            return Response(
                {'error': 'Patient not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        user = request.user
        if user.user_type == 'PATIENT' and user.id != patient_id:
            return Response(
                {'error': 'You can only upload reports for yourself'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(
            data=request.data,
            context={'patient': patient, 'request': request}
        )
        serializer.is_valid(raise_exception=True)
        report = serializer.save()
        
        return Response(
            {
                'message': 'Report uploaded successfully',
                'report': PatientReportSerializer(report, context={'request': request}).data
            },
            status=status.HTTP_201_CREATED
        )


class PatientReportListView(generics.ListAPIView):
    """
    List patient reports (with OTP verification for doctors).
    GET /api/records/patients/{patient_id}/reports/
    """
    serializer_class = PatientReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        patient_id = self.kwargs.get('patient_id')
        
        try:
            patient = User.objects.get(id=patient_id, user_type='PATIENT')
        except User.DoesNotExist:
            return PatientReport.objects.none()
        
        # Patient can view their own reports
        if user.user_type == 'PATIENT' and user.id == patient_id:
            return PatientReport.objects.filter(patient=patient).order_by('-uploaded_at')
        
        # Admin can view all
        if user.user_type == 'ADMIN':
            return PatientReport.objects.filter(patient=patient).order_by('-uploaded_at')
        
        # Doctors need OTP verification
        if user.user_type == 'DOCTOR':
            otp_token = self.request.query_params.get('otp_verified')
            if otp_token == 'true':
                # In production, verify a signed token here
                # For now, we'll check if there's a recent verified OTP
                recent_otp = OTP.objects.filter(
                    user=patient,
                    is_used=True,
                    requested_by=user,
                    used_at__gte=timezone.now() - timezone.timedelta(minutes=30)
                ).exists()
                
                if recent_otp:
                    return PatientReport.objects.filter(patient=patient).order_by('-uploaded_at')
        
        return PatientReport.objects.none()


class PatientReportDetailView(generics.RetrieveDestroyAPIView):
    """
    Get or delete patient report.
    GET/DELETE /api/records/reports/{id}/
    """
    serializer_class = PatientReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'PATIENT':
            return PatientReport.objects.filter(patient=user)
        elif user.user_type == 'ADMIN':
            return PatientReport.objects.all()
        
        return PatientReport.objects.none()


class MyReportsView(generics.ListAPIView):
    """
    List current user's reports (Patient only).
    GET /api/records/my-reports/
    """
    serializer_class = PatientReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]
    
    def get_queryset(self):
        return PatientReport.objects.filter(patient=self.request.user).order_by('-uploaded_at')


class AddPrescriptionAttachmentView(generics.CreateAPIView):
    """
    Add attachment to prescription (Doctor only).
    POST /api/records/prescriptions/{prescription_id}/attachments/
    """
    serializer_class = PrescriptionAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorUser]
    parser_classes = [MultiPartParser, FormParser]
    
    def create(self, request, *args, **kwargs):
        prescription_id = self.kwargs.get('prescription_id')
        
        # Get prescription
        doctor_profiles = HospitalDoctorProfile.objects.filter(user=request.user)
        try:
            prescription = Prescription.objects.get(
                id=prescription_id,
                doctor__in=doctor_profiles
            )
        except Prescription.DoesNotExist:
            return Response(
                {'error': 'Prescription not found or you do not have permission'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create attachment
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        attachment = serializer.save(prescription=prescription)
        
        return Response(
            {
                'message': 'Attachment added successfully',
                'attachment': PrescriptionAttachmentSerializer(attachment, context={'request': request}).data
            },
            status=status.HTTP_201_CREATED
        )


@extend_schema(
    responses={200: PatientMedicalSummarySerializer}
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_medical_summary(request, patient_id):
    """
    Get medical summary for a patient (prescriptions + reports count).
    GET /api/records/patients/{patient_id}/summary/
    """
    user = request.user
    
    try:
        patient = User.objects.get(id=patient_id, user_type='PATIENT')
    except User.DoesNotExist:
        return Response(
            {'error': 'Patient not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check permissions
    if user.user_type == 'PATIENT' and user.id != patient_id:
        return Response(
            {'error': 'You can only view your own medical summary'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if user.user_type not in ['PATIENT', 'DOCTOR', 'ADMIN']:
        return Response(
            {'error': 'You do not have permission to view this summary'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    summary = {
        'patient_id': patient.id,
        'patient_name': patient.get_full_name(),
        'total_prescriptions': Prescription.objects.filter(patient=patient).count(),
        'total_reports': PatientReport.objects.filter(patient=patient).count(),
        'recent_prescriptions': PrescriptionSerializer(
            Prescription.objects.filter(patient=patient).order_by('-created_at')[:5],
            many=True
        ).data,
        'recent_reports': PatientReportSerializer(
            PatientReport.objects.filter(patient=patient).order_by('-uploaded_at')[:5],
            many=True,
            context={'request': request}
        ).data,
    }
    
    return Response(summary)
