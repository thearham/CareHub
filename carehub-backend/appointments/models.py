"""
Models for appointments app.
"""
from django.db import models
from accounts.models import User
from hospitals.models import Hospital, Department, HospitalDoctorProfile


class Appointment(models.Model):
    """
    Appointment model for patient appointment requests.
    """
    
    STATUS_CHOICES = [
        ('REQUESTED', 'Requested'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]
    
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='appointments',
        limit_choices_to={'user_type': 'PATIENT'}
    )
    
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name='appointments'
    )
    
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='appointments'
    )
    
    assigned_doctor = models.ForeignKey(
        HospitalDoctorProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments',
        help_text='Doctor assigned by hospital'
    )
    
    requested_time = models.DateTimeField(help_text='Patient requested appointment time')
    confirmed_time = models.DateTimeField(null=True, blank=True, help_text='Hospital confirmed time')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REQUESTED')
    
    reason = models.TextField(blank=True, help_text='Reason for appointment')
    notes = models.TextField(blank=True, help_text='Additional notes from hospital/doctor')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Audit fields
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_appointments',
        help_text='Hospital user who assigned the doctor'
    )
    assigned_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'appointments'
        verbose_name = 'Appointment'
        verbose_name_plural = 'Appointments'
        ordering = ['-requested_time']
        indexes = [
            models.Index(fields=['patient', 'status']),
            models.Index(fields=['hospital', 'status']),
            models.Index(fields=['assigned_doctor', 'status']),
            models.Index(fields=['requested_time']),
        ]
    
    def __str__(self):
        return f"Appointment for {self.patient.get_full_name()} at {self.hospital.name} - {self.status}"
    
    def can_be_assigned(self):
        """Check if appointment can be assigned a doctor."""
        return self.status == 'REQUESTED' and self.assigned_doctor is None
    
    def can_be_confirmed(self):
        """Check if appointment can be confirmed."""
        return self.status == 'REQUESTED' and self.assigned_doctor is not None
