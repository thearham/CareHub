"""
Serializers for appointments app.
"""
from rest_framework import serializers
from django.utils import timezone
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for Appointment model."""
    
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    patient_phone = serializers.CharField(source='patient.phone_number', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    doctor_name = serializers.CharField(source='assigned_doctor.get_doctor_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.get_full_name', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'patient_phone',
            'hospital', 'hospital_name', 'department', 'department_name',
            'assigned_doctor', 'doctor_name', 'requested_time', 'confirmed_time',
            'status', 'reason', 'notes', 'assigned_by', 'assigned_by_name',
            'assigned_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'assigned_by', 'assigned_at', 'created_at', 'updated_at',
            'confirmed_time'
        ]


class CreateAppointmentSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments (Patient)."""
    
    class Meta:
        model = Appointment
        fields = ['hospital', 'department', 'requested_time', 'reason']
    
    def validate_requested_time(self, value):
        """Ensure requested time is in the future."""
        if value <= timezone.now():
            raise serializers.ValidationError("Requested time must be in the future.")
        return value
    
    def validate(self, attrs):
        """Validate department belongs to hospital."""
        hospital = attrs.get('hospital')
        department = attrs.get('department')
        
        if department.hospital != hospital:
            raise serializers.ValidationError({
                "department": "Selected department does not belong to the selected hospital."
            })
        
        if not hospital.is_approved:
            raise serializers.ValidationError({
                "hospital": "Selected hospital is not approved yet."
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create appointment with patient from context."""
        patient = self.context['request'].user
        validated_data['patient'] = patient
        validated_data['status'] = 'REQUESTED'
        return super().create(validated_data)


class AssignDoctorSerializer(serializers.Serializer):
    """Serializer for assigning doctor to appointment."""
    
    doctor_id = serializers.IntegerField(required=True)
    confirmed_time = serializers.DateTimeField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_confirmed_time(self, value):
        """Ensure confirmed time is in the future if provided."""
        if value and value <= timezone.now():
            raise serializers.ValidationError("Confirmed time must be in the future.")
        return value


class UpdateAppointmentStatusSerializer(serializers.Serializer):
    """Serializer for updating appointment status."""
    
    status = serializers.ChoiceField(choices=['CONFIRMED', 'CANCELLED', 'COMPLETED'])
    notes = serializers.CharField(required=False, allow_blank=True)


class DoctorAppointmentSerializer(serializers.ModelSerializer):
    """Serializer for doctor's view of appointments."""
    
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    patient_phone = serializers.CharField(source='patient.phone_number', read_only=True)
    patient_email = serializers.CharField(source='patient.email', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'patient_phone', 'patient_email',
            'hospital_name', 'department_name', 'requested_time', 'confirmed_time',
            'status', 'reason', 'notes', 'created_at'
        ]
        read_only_fields = fields


class AppointmentResponseSerializer(serializers.Serializer):
    """Response serializer for appointment actions."""
    message = serializers.CharField()
    appointment = AppointmentSerializer()
