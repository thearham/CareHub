"""
URL configuration for records app.
"""
from django.urls import path
from .views import (
    CreatePrescriptionView,
    PrescriptionListView,
    PrescriptionDetailView,
    PatientPrescriptionHistoryView,
    UploadPatientReportView,
    PatientReportListView,
    PatientReportDetailView,
    MyReportsView,
    AddPrescriptionAttachmentView,
    patient_medical_summary,
)

app_name = 'records'

urlpatterns = [
    # Prescriptions
    path('prescriptions/', PrescriptionListView.as_view(), name='prescription-list'),
    path('prescriptions/create/', CreatePrescriptionView.as_view(), name='create-prescription'),
    path('prescriptions/<int:pk>/', PrescriptionDetailView.as_view(), name='prescription-detail'),
    path('prescriptions/<int:prescription_id>/attachments/', AddPrescriptionAttachmentView.as_view(), name='add-attachment'),
    
    # Patient reports
    path('my-reports/', MyReportsView.as_view(), name='my-reports'),
    path('reports/<int:pk>/', PatientReportDetailView.as_view(), name='report-detail'),
    
    # Patient-specific records
    path('patients/<int:patient_id>/prescriptions/', PatientPrescriptionHistoryView.as_view(), name='patient-prescriptions'),
    path('patients/<int:patient_id>/reports/', PatientReportListView.as_view(), name='patient-reports'),
    path('patients/<int:patient_id>/reports/upload/', UploadPatientReportView.as_view(), name='upload-report'),
    path('patients/<int:patient_id>/summary/', patient_medical_summary, name='patient-summary'),
]
