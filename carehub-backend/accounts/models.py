"""
Custom User model and OTP model for authentication.
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.core.validators import RegexValidator
import secrets
import hashlib
from datetime import timedelta


class UserManager(BaseUserManager):
    """Custom user manager for User model."""
    
    def create_user(self, username, password=None, **extra_fields):
        """Create and save a regular user."""
        if not username:
            raise ValueError('The Username field must be set')
        
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, password=None, **extra_fields):
        """Create and save a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('user_type', 'ADMIN')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model with username-based authentication.
    Email is NOT unique to allow multiple doctor accounts with same email across hospitals.
    """
    
    USER_TYPE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('HOSPITAL', 'Hospital'),
        ('DOCTOR', 'Doctor'),
        ('PATIENT', 'Patient'),
    ]
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    
    username = models.CharField(max_length=150, unique=True, db_index=True)
    email = models.EmailField(max_length=255, blank=True)  # NOT unique
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['user_type']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.user_type})"
    
    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name


class OTP(models.Model):
    """
    OTP model for patient repository access verification.
    OTPs are single-use and expire after configured time.
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='otps',
        limit_choices_to={'user_type': 'PATIENT'}
    )
    code_hash = models.CharField(max_length=64)  # Store hashed OTP for security
    phone_number = models.CharField(max_length=17)
    
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    
    # Audit fields
    requested_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='requested_otps',
        help_text='Doctor who requested OTP access'
    )
    
    class Meta:
        db_table = 'otps'
        verbose_name = 'OTP'
        verbose_name_plural = 'OTPs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone_number', 'created_at']),
            models.Index(fields=['expires_at', 'is_used']),
        ]
    
    def __str__(self):
        return f"OTP for {self.phone_number} - {'Used' if self.is_used else 'Active'}"
    
    @staticmethod
    def hash_code(code):
        """Hash the OTP code for secure storage."""
        return hashlib.sha256(code.encode()).hexdigest()
    
    def verify_code(self, code):
        """Verify if the provided code matches the stored hash."""
        return self.code_hash == self.hash_code(code)
    
    def is_valid(self):
        """Check if OTP is still valid (not expired and not used)."""
        return (
            not self.is_used
            and timezone.now() < self.expires_at
        )
    
    def mark_as_used(self):
        """Mark OTP as used."""
        self.is_used = True
        self.used_at = timezone.now()
        self.save(update_fields=['is_used', 'used_at'])
    
    @classmethod
    def generate_otp_code(cls, length=6):
        """Generate a random numeric OTP code."""
        return ''.join([str(secrets.randbelow(10)) for _ in range(length)])
    
    @classmethod
    def create_otp(cls, user, phone_number, requested_by=None, expiry_minutes=10):
        """
        Create a new OTP for a user.
        Returns tuple: (otp_instance, plain_code)
        """
        from django.conf import settings
        
        expiry_minutes = getattr(settings, 'OTP_EXPIRY_MINUTES', expiry_minutes)
        otp_length = getattr(settings, 'OTP_LENGTH', 6)
        
        plain_code = cls.generate_otp_code(length=otp_length)
        code_hash = cls.hash_code(plain_code)
        
        expires_at = timezone.now() + timedelta(minutes=expiry_minutes)
        
        otp = cls.objects.create(
            user=user,
            code_hash=code_hash,
            phone_number=phone_number,
            expires_at=expires_at,
            requested_by=requested_by
        )
        
        return otp, plain_code


class AuditLog(models.Model):
    """
    Audit log for tracking important actions in the system.
    """
    
    ACTION_CHOICES = [
        ('USER_CREATED', 'User Created'),
        ('USER_UPDATED', 'User Updated'),
        ('USER_DELETED', 'User Deleted'),
        ('HOSPITAL_APPROVED', 'Hospital Approved'),
        ('DOCTOR_CREATED', 'Doctor Created'),
        ('OTP_REQUESTED', 'OTP Requested'),
        ('OTP_VERIFIED', 'OTP Verified'),
        ('PASSWORD_RETURNED', 'Password Returned to Hospital'),
    ]
    
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='performed_actions')
    
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_logs'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.action} by {self.performed_by} at {self.timestamp}"
