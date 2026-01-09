"""
Models for records app - prescriptions and patient reports.
"""
from django.db import models
from django.core.validators import FileExtensionValidator
from accounts.models import User
from hospitals.models import Hospital, HospitalDoctorProfile
from appointments.models import Appointment
import os


def patient_report_upload_path(instance, filename):
    """Generate upload path for patient reports."""
    return f'patient_reports/{instance.patient.id}/{filename}'


class Prescription(models.Model):
    """
    Prescription model created by doctors for patients.
    """
    
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name='prescriptions',
        null=True,
        blank=True,
        help_text='Related appointment if applicable'
    )
    
    doctor = models.ForeignKey(
        HospitalDoctorProfile,
        on_delete=models.CASCADE,
        related_name='prescriptions'
    )
    
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='prescriptions',
        limit_choices_to={'user_type': 'PATIENT'}
    )
    
    # Clinical information
    diagnosis = models.TextField(help_text='Diagnosis details')
    investigations = models.TextField(blank=True, help_text='Recommended investigations/tests')
    treatment_plan = models.TextField(blank=True, help_text='Treatment plan and recommendations')
    
    # Medicines as JSON list
    medicines = models.JSONField(
        default=list,
        help_text='List of medicines with dosage, frequency, duration'
    )
    
    # Additional details
    follow_up_date = models.DateField(null=True, blank=True, help_text='Recommended follow-up date')
    referral_notes = models.TextField(blank=True, help_text='Referral to specialist if needed')
    doctor_notes = models.TextField(blank=True, help_text='Additional notes from doctor')
    
    # Versioning
    version = models.IntegerField(default=1, help_text='Prescription version number')
    previous_version = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='revisions'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'prescriptions'
        verbose_name = 'Prescription'
        verbose_name_plural = 'Prescriptions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'created_at']),
            models.Index(fields=['doctor', 'created_at']),
            models.Index(fields=['appointment']),
        ]
    
    def __str__(self):
        return f"Prescription for {self.patient.get_full_name()} by Dr. {self.doctor.get_doctor_name()}"
    
    def create_revision(self):
        """Create a new version of this prescription."""
        new_prescription = Prescription.objects.create(
            appointment=self.appointment,
            doctor=self.doctor,
            patient=self.patient,
            diagnosis=self.diagnosis,
            investigations=self.investigations,
            treatment_plan=self.treatment_plan,
            medicines=self.medicines,
            follow_up_date=self.follow_up_date,
            referral_notes=self.referral_notes,
            doctor_notes=self.doctor_notes,
            version=self.version + 1,
            previous_version=self
        )
        return new_prescription


class PatientReport(models.Model):
    """
    Patient medical reports and documents.
    """
    
    FILE_TYPE_CHOICES = [
        ('LAB', 'Lab Report'),
        ('PRESCRIPTION', 'Prescription'),
        ('XRAY', 'X-Ray'),
        ('MRI', 'MRI Scan'),
        ('CT', 'CT Scan'),
        ('ULTRASOUND', 'Ultrasound'),
        ('OTHER', 'Other'),
    ]
    
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='medical_reports',
        limit_choices_to={'user_type': 'PATIENT'}
    )
    
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='patient_reports',
        help_text='Hospital where report was generated (if applicable)'
    )
    
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_reports',
        help_text='User who uploaded the report'
    )
    
    file = models.FileField(
        upload_to=patient_report_upload_path,
        validators=[
            FileExtensionValidator(
                allowed_extensions=['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
            )
        ]
    )
    
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES)
    file_size = models.IntegerField(help_text='File size in bytes')
    
    title = models.CharField(max_length=255, help_text='Report title')
    description = models.TextField(blank=True, help_text='Report description')
    
    report_date = models.DateField(null=True, blank=True, help_text='Date of the medical report/test')
    
    # Metadata
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'patient_reports'
        verbose_name = 'Patient Report'
        verbose_name_plural = 'Patient Reports'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['patient', 'uploaded_at']),
            models.Index(fields=['file_type']),
            models.Index(fields=['hospital']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.patient.get_full_name()}"
    
    def get_file_extension(self):
        """Get file extension."""
        return os.path.splitext(self.file.name)[1]
    
    def save(self, *args, **kwargs):
        """Override save to set file_size."""
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)


class PrescriptionAttachment(models.Model):
    """
    Attachments for prescriptions (e.g., test results, images).
    """
    
    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    
    file = models.FileField(
        upload_to='prescription_attachments/',
        validators=[
            FileExtensionValidator(
                allowed_extensions=['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
            )
        ]
    )
    
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()
    description = models.TextField(blank=True)
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'prescription_attachments'
        verbose_name = 'Prescription Attachment'
        verbose_name_plural = 'Prescription Attachments'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"Attachment for Prescription {self.prescription.id}"
    
    def save(self, *args, **kwargs):
        """Override save to set file_size and file_name."""
        if self.file:
            self.file_size = self.file.size
            if not self.file_name:
                self.file_name = os.path.basename(self.file.name)
        super().save(*args, **kwargs)
