"""
Serializers for accounts app.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User, OTP, AuditLog


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'user_type', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined', 'user_type']
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class PatientRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for patient self-registration."""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    consent = serializers.BooleanField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm', 'first_name',
            'last_name', 'phone_number', 'consent'
        ]
    
    def validate(self, attrs):
        """Validate password match and consent."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        if not attrs.get('consent'):
            raise serializers.ValidationError({"consent": "You must provide consent to register."})
        
        return attrs
    
    def create(self, validated_data):
        """Create patient user."""
        validated_data.pop('password_confirm')
        validated_data.pop('consent')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data.get('phone_number', ''),
            user_type='PATIENT',
            is_active=True
        )
        
        return user


class HospitalRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for hospital registration (creates hospital user)."""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    hospital_name = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number', 'hospital_name'
        ]
    
    def validate(self, attrs):
        """Validate password match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        return attrs
    
    def create(self, validated_data):
        """Create hospital user (will be linked to Hospital model in hospitals app)."""
        validated_data.pop('password_confirm')
        hospital_name = validated_data.pop('hospital_name')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data.get('phone_number', ''),
            user_type='HOSPITAL',
            is_active=False  # Inactive until approved by admin
        )
        
        # Store hospital_name in context for use in view
        self.context['hospital_name'] = hospital_name
        
        return user


class OTPGenerateSerializer(serializers.Serializer):
    """Serializer for OTP generation request."""
    
    patient_phone = serializers.CharField(max_length=17, required=True)
    patient_id = serializers.IntegerField(required=False)
    
    def validate_patient_phone(self, value):
        """Validate phone number format."""
        import re
        if not re.match(r'^\+?1?\d{9,15}$', value):
            raise serializers.ValidationError(
                "Phone number must be in format: '+999999999'. Up to 15 digits allowed."
            )
        return value


class OTPVerifySerializer(serializers.Serializer):
    """Serializer for OTP verification."""
    
    patient_phone = serializers.CharField(max_length=17, required=True)
    otp = serializers.CharField(max_length=10, required=True)
    
    def validate_otp(self, value):
        """Validate OTP is numeric."""
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        """Validate passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for AuditLog model."""
    
    user_username = serializers.CharField(source='user.username', read_only=True)
    performed_by_username = serializers.CharField(source='performed_by.username', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'action', 'user', 'user_username', 'performed_by',
            'performed_by_username', 'details', 'ip_address', 'timestamp'
        ]
        read_only_fields = fields


class ChangePasswordResponseSerializer(serializers.Serializer):
    """Response serializer for password change."""
    message = serializers.CharField()


class OTPGenerateResponseSerializer(serializers.Serializer):
    """Response serializer for OTP generation."""
    message = serializers.CharField()
    expires_at = serializers.DateTimeField()
    phone_number = serializers.CharField(help_text="Last 4 digits of phone number")


class OTPVerifyResponseSerializer(serializers.Serializer):
    """Response serializer for OTP verification."""
    message = serializers.CharField()
    patient_id = serializers.IntegerField()
    verified = serializers.BooleanField()
    access_granted_until = serializers.DateTimeField()


class DashboardStatsSerializer(serializers.Serializer):
    """Response serializer for dashboard statistics."""
    total_users = serializers.IntegerField()
    total_patients = serializers.IntegerField()
    total_doctors = serializers.IntegerField()
    total_hospitals = serializers.IntegerField()
    approved_hospitals = serializers.IntegerField()
    pending_hospitals = serializers.IntegerField()
    total_appointments = serializers.IntegerField()
    pending_appointments = serializers.IntegerField()
