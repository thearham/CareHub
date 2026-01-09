"""
Serializers for hospitals app.
"""
from rest_framework import serializers
from django.utils import timezone
from accounts.models import User
from accounts.utils import generate_username, generate_strong_password, log_action
from .models import Hospital, Department, HospitalDoctorProfile


class HospitalSerializer(serializers.ModelSerializer):
    """Serializer for Hospital model."""
    
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Hospital
        fields = [
            'id', 'user', 'user_username', 'user_email', 'name', 'license_number',
            'email', 'phone', 'address', 'location', 'latitude', 'longitude',
            'is_approved', 'approved_by', 'approved_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_approved', 'approved_by', 'approved_at', 'created_at', 'updated_at']


class HospitalRegistrationSerializer(serializers.Serializer):
    """
    Serializer for hospital registration.
    Creates both User and Hospital records.
    """
    
    # User fields
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone_number = serializers.CharField(max_length=17)
    
    # Hospital fields
    hospital_name = serializers.CharField(max_length=255)
    license_number = serializers.CharField(max_length=100)
    hospital_email = serializers.EmailField()
    hospital_phone = serializers.CharField(max_length=17)
    address = serializers.CharField()
    location = serializers.CharField()
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    
    def validate(self, attrs):
        """Validate passwords match and username/license uniqueness."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "Username already exists."})
        
        if Hospital.objects.filter(license_number=attrs['license_number']).exists():
            raise serializers.ValidationError({"license_number": "Hospital with this license number already exists."})
        
        return attrs
    
    def create(self, validated_data):
        """Create User and Hospital records."""
        password = validated_data.pop('password')
        validated_data.pop('password_confirm')
        
        # Extract hospital-specific fields
        hospital_data = {
            'name': validated_data.pop('hospital_name'),
            'license_number': validated_data.pop('license_number'),
            'email': validated_data.pop('hospital_email'),
            'phone': validated_data.pop('hospital_phone'),
            'address': validated_data.pop('address'),
            'location': validated_data.pop('location'),
            'latitude': validated_data.pop('latitude', None),
            'longitude': validated_data.pop('longitude', None),
        }
        
        # Create user (inactive until approved)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data['phone_number'],
            user_type='HOSPITAL',
            is_active=False
        )
        
        # Create hospital
        hospital = Hospital.objects.create(
            user=user,
            **hospital_data
        )
        
        return hospital


class HospitalApprovalSerializer(serializers.Serializer):
    """Serializer for hospital approval action."""
    
    is_approved = serializers.BooleanField(required=True)


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model."""
    
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    
    class Meta:
        model = Department
        fields = ['id', 'hospital', 'hospital_name', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'hospital', 'hospital_name', 'created_at', 'updated_at']  # 👈 ADD 'hospital' here
    
    # Remove or simplify the validate method since hospital comes from view
    def validate_name(self, value):
        """Basic name validation."""
        if not value or not value.strip():
            raise serializers.ValidationError("Department name is required.")
        return value.strip()

class HospitalDoctorProfileSerializer(serializers.ModelSerializer):
    """Serializer for HospitalDoctorProfile model."""
    
    doctor_name = serializers.CharField(source='user.get_full_name', read_only=True)
    doctor_username = serializers.CharField(source='user.username', read_only=True)
    doctor_email = serializers.CharField(source='user.email', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    
    class Meta:
        model = HospitalDoctorProfile
        fields = [
            'id', 'hospital', 'hospital_name', 'user', 'doctor_name', 'doctor_username',
            'doctor_email', 'cnic', 'address', 'license_number', 'specialization',
            'phone_number', 'available_timings', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class CreateDoctorSerializer(serializers.Serializer):
    """
    Serializer for creating a doctor account by hospital.
    Returns generated username and password.
    """
    
    # Doctor personal info
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=17)
    
    # Doctor professional info
    cnic = serializers.CharField(max_length=20, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    license_number = serializers.CharField(max_length=100, required=False, allow_blank=True)  # 👈 Make optional
    specialization = serializers.CharField(max_length=255)
    department = serializers.PrimaryKeyRelatedField(  # 👈 ADD THIS
        queryset=Department.objects.all(),
        required=False,
        allow_null=True
    )
    available_timings = serializers.JSONField(required=False, default=dict)
    
    def validate(self, attrs):
        """Validate license number uniqueness within hospital."""
        hospital = self.context.get('hospital')
        license_number = attrs.get('license_number')
        
        # Only validate if license_number is provided
        if license_number:
            if HospitalDoctorProfile.objects.filter(hospital=hospital, license_number=license_number).exists():
                raise serializers.ValidationError({
                    "license_number": "A doctor with this license number already exists in your hospital."
                })
        
        # Validate department belongs to this hospital
        department = attrs.get('department')
        if department and department.hospital != hospital:
            raise serializers.ValidationError({
                "department": "Department does not belong to this hospital."
            })
        
        return attrs
    
    def create(self, validated_data):
        """
        Create doctor user and hospital doctor profile.
        Returns tuple: (profile, generated_password)
        """
        hospital = self.context['hospital']
        created_by = self.context['request'].user
        
        # Pop department from validated_data
        department = validated_data.pop('department', None)
        
        # Generate username
        full_name = f"{validated_data['first_name']} {validated_data['last_name']}"
        username = generate_username(full_name, hospital.name)
        
        # Generate strong password
        password = generate_strong_password()
        
        # Create doctor user
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=password,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data['phone_number'],
            user_type='DOCTOR',
            is_active=True
        )
        
        # Create hospital doctor profile
        profile = HospitalDoctorProfile.objects.create(
            hospital=hospital,
            user=user,
            department=department,  # 👈 ADD THIS
            cnic=validated_data.get('cnic', ''),
            address=validated_data.get('address', ''),
            license_number=validated_data.get('license_number', ''),
            specialization=validated_data['specialization'],
            phone_number=validated_data['phone_number'],
            available_timings=validated_data.get('available_timings', {}),
            created_by=created_by,
            is_active=True
        )
        
        # Log the action
        log_action(
            action='DOCTOR_CREATED',
            user=user,
            performed_by=created_by,
            details={
                'hospital_id': hospital.id,
                'hospital_name': hospital.name,
                'username': username,
                'specialization': validated_data['specialization']
            },
            request=self.context.get('request')
        )
        
        # Log that password was returned
        log_action(
            action='PASSWORD_RETURNED',
            user=user,
            performed_by=created_by,
            details={
                'hospital_id': hospital.id,
                'hospital_name': hospital.name,
                'username': username,
                'note': 'Generated password returned to hospital in API response'
            },
            request=self.context.get('request')
        )
        
        return profile, password


class NearbyHospitalSerializer(serializers.ModelSerializer):
    """Serializer for nearby hospital search results."""
    
    distance_km = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Hospital
        fields = [
            'id', 'name', 'email', 'phone', 'address', 'location',
            'latitude', 'longitude', 'distance_km'
        ]


class HospitalApprovalResponseSerializer(serializers.Serializer):
    """Response serializer for hospital approval."""
    message = serializers.CharField()
    hospital = HospitalSerializer()


class CreateDoctorResponseSerializer(serializers.Serializer):
    """Response serializer for doctor creation."""
    message = serializers.CharField()
    doctor = HospitalDoctorProfileSerializer()
    credentials = serializers.DictField()


class NearbyHospitalsResponseSerializer(serializers.Serializer):
    """Response serializer for nearby hospitals search."""
    hospitals = NearbyHospitalSerializer(many=True)
    count = serializers.IntegerField()
