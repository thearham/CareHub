"""
Models for hospitals app.
"""
from django.db import models
from django.core.validators import RegexValidator
from accounts.models import User


class Hospital(models.Model):
    """
    Hospital model representing registered healthcare facilities.
    """
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='hospital_profile',
        limit_choices_to={'user_type': 'HOSPITAL'}
    )
    
    name = models.CharField(max_length=255)
    license_number = models.CharField(max_length=100, unique=True)
    
    # Contact information
    email = models.EmailField()
    phone = models.CharField(max_length=17)
    address = models.TextField()
    location = models.TextField(help_text='Detailed location/area description')
    
    # Geolocation for nearby hospital search
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Approval status
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_hospitals',
        limit_choices_to={'user_type': 'ADMIN'}
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'hospitals'
        verbose_name = 'Hospital'
        verbose_name_plural = 'Hospitals'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_approved', 'created_at']),
            models.Index(fields=['license_number']),
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return f"{self.name} - {'Approved' if self.is_approved else 'Pending'}"


class Department(models.Model):
    """
    Hospital departments (e.g., Cardiology, Neurology).
    """
    
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name='departments'
    )
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'departments'
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
        ordering = ['hospital', 'name']
        unique_together = [['hospital', 'name']]
        indexes = [
            models.Index(fields=['hospital', 'name']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.hospital.name}"


class HospitalDoctorProfile(models.Model):
    """
    Links a doctor user account to a specific hospital.
    A doctor can have multiple profiles (one per hospital they work at).
    """
    
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name='doctor_profiles'
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='doctor_profiles',
        limit_choices_to={'user_type': 'DOCTOR'}
    )
    
    # 👇 ADD THIS FIELD
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doctors'
    )
    
    # Doctor details
    cnic = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    license_number = models.CharField(max_length=100, blank=True)  # 👈 Also make this optional
    specialization = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=17)
    
    # Availability
    available_timings = models.JSONField(
        default=dict,
        blank=True,
        help_text='JSON object with day: [time_slots] mapping'
    )
    
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_doctor_profiles'
    )
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'hospital_doctor_profiles'
        verbose_name = 'Hospital Doctor Profile'
        verbose_name_plural = 'Hospital Doctor Profiles'
        ordering = ['-created_at']
        unique_together = [['hospital', 'user']]
        indexes = [
            models.Index(fields=['hospital', 'is_active']),
            models.Index(fields=['user', 'hospital']),
            models.Index(fields=['specialization']),
        ]
    
    def __str__(self):
        return f"Dr. {self.user.get_full_name()} at {self.hospital.name}"
    
    def get_doctor_name(self):
        """Return doctor's full name."""
        return self.user.get_full_name()