"""
Serializers for records app.
"""
from rest_framework import serializers
from django.conf import settings
from .models import Prescription, PatientReport, PrescriptionAttachment


class PrescriptionSerializer(serializers.ModelSerializer):
    """Serializer for Prescription model."""
    
    doctor_name = serializers.CharField(source='doctor.get_doctor_name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    hospital_name = serializers.CharField(source='doctor.hospital.name', read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    appointment_id = serializers.IntegerField(source='appointment.id', read_only=True)
    
    class Meta:
        model = Prescription
        fields = [
            'id', 'appointment', 'appointment_id', 'doctor', 'doctor_name',
            'doctor_specialization', 'hospital_name', 'patient', 'patient_name',
            'diagnosis', 'investigations', 'treatment_plan', 'medicines',
            'follow_up_date', 'referral_notes', 'doctor_notes', 'version',
            'previous_version', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'version', 'previous_version', 'created_at', 'updated_at']


class CreatePrescriptionSerializer(serializers.ModelSerializer):
    """Serializer for creating prescriptions (Doctor)."""
    
    class Meta:
        model = Prescription
        fields = [
            'appointment', 'patient', 'diagnosis', 'investigations',
            'treatment_plan', 'medicines', 'follow_up_date',
            'referral_notes', 'doctor_notes'
        ]
    
    def validate_medicines(self, value):
        """Validate medicines is a list."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Medicines must be a list.")
        
        # Validate each medicine entry has required fields
        for medicine in value:
            if not isinstance(medicine, dict):
                raise serializers.ValidationError("Each medicine must be a dictionary.")
            
            required_fields = ['name', 'dosage', 'frequency']
            for field in required_fields:
                if field not in medicine:
                    raise serializers.ValidationError(f"Medicine entry missing required field: {field}")
        
        return value
    
    def validate(self, attrs):
        """Validate appointment and patient consistency."""
        appointment = attrs.get('appointment')
        patient = attrs.get('patient')
        
        if appointment and appointment.patient != patient:
            raise serializers.ValidationError({
                "patient": "Patient must match the appointment's patient."
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create prescription with doctor from context."""
        doctor_profile = self.context['doctor_profile']
        validated_data['doctor'] = doctor_profile
        return super().create(validated_data)


class PatientReportSerializer(serializers.ModelSerializer):
    """Serializer for PatientReport model."""
    
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_extension = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientReport
        fields = [
            'id', 'patient', 'patient_name', 'hospital', 'hospital_name',
            'uploaded_by', 'uploaded_by_name', 'file', 'file_url', 'file_type',
            'file_size', 'file_extension', 'title', 'description', 'report_date',
            'uploaded_at', 'updated_at'
        ]
        read_only_fields = ['id', 'file_size', 'uploaded_by', 'uploaded_at', 'updated_at']
    
    def get_file_url(self, obj):
        """Get full URL for file."""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_file_extension(self, obj):
        """Get file extension."""
        return obj.get_file_extension()


class UploadPatientReportSerializer(serializers.ModelSerializer):
    """Serializer for uploading patient reports."""
    
    class Meta:
        model = PatientReport
        fields = ['file', 'file_type', 'title', 'description', 'report_date', 'hospital']
    
    def validate_file(self, value):
        """Validate file size and extension."""
        # Check file size
        max_size = getattr(settings, 'MAX_UPLOAD_SIZE', 10 * 1024 * 1024)  # 10MB default
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File size exceeds maximum allowed size of {max_size / (1024 * 1024)}MB."
            )
        
        # Check file extension
        allowed_extensions = getattr(
            settings,
            'ALLOWED_UPLOAD_EXTENSIONS',
            ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
        )
        
        file_extension = value.name.split('.')[-1].lower()
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"File extension '{file_extension}' is not allowed. "
                f"Allowed extensions: {', '.join(allowed_extensions)}"
            )
        
        return value
    
    def create(self, validated_data):
        """Create report with patient and uploaded_by from context."""
        patient = self.context.get('patient')
        uploaded_by = self.context['request'].user
        
        validated_data['patient'] = patient
        validated_data['uploaded_by'] = uploaded_by
        
        return super().create(validated_data)


class PrescriptionAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for PrescriptionAttachment model."""
    
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PrescriptionAttachment
        fields = ['id', 'prescription', 'file', 'file_url', 'file_name', 'file_size', 'description', 'uploaded_at']
        read_only_fields = ['id', 'file_name', 'file_size', 'uploaded_at']
    
    def get_file_url(self, obj):
        """Get full URL for file."""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class PrescriptionWithAttachmentsSerializer(PrescriptionSerializer):
    """Prescription serializer with attachments."""
    
    attachments = PrescriptionAttachmentSerializer(many=True, read_only=True)
    
    class Meta(PrescriptionSerializer.Meta):
        fields = PrescriptionSerializer.Meta.fields + ['attachments']


class PatientMedicalSummarySerializer(serializers.Serializer):
    """Response serializer for patient medical summary."""
    patient_id = serializers.IntegerField()
    patient_name = serializers.CharField()
    total_prescriptions = serializers.IntegerField()
    total_reports = serializers.IntegerField()
    recent_prescriptions = PrescriptionSerializer(many=True)
    recent_reports = PatientReportSerializer(many=True)
