"""
Serializers for recommendations app.
"""
from rest_framework import serializers
from .models import MedicineRecommendation


class MedicineRecommendationRequestSerializer(serializers.Serializer):
    """Serializer for medicine recommendation request."""
    
    medicine_name = serializers.CharField(max_length=255, required=True)
    patient_info = serializers.JSONField(required=False, default=dict)
    
    def validate_medicine_name(self, value):
        """Validate medicine name is not empty."""
        if not value.strip():
            raise serializers.ValidationError("Medicine name cannot be empty.")
        return value.strip()
    
    def validate_patient_info(self, value):
        """Validate patient_info structure."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Patient info must be a dictionary.")
        
        # Validate optional fields
        allowed_fields = ['age', 'allergies', 'comorbidities', 'current_medications', 'gender', 'weight']
        for key in value.keys():
            if key not in allowed_fields:
                raise serializers.ValidationError(
                    f"Invalid field '{key}' in patient_info. "
                    f"Allowed fields: {', '.join(allowed_fields)}"
                )
        
        # Validate age if provided
        if 'age' in value:
            try:
                age = int(value['age'])
                if age < 0 or age > 150:
                    raise serializers.ValidationError("Age must be between 0 and 150.")
            except (ValueError, TypeError):
                raise serializers.ValidationError("Age must be a valid number.")
        
        # Validate allergies is a list if provided
        if 'allergies' in value and not isinstance(value['allergies'], list):
            raise serializers.ValidationError("Allergies must be a list.")
        
        # Validate comorbidities is a list if provided
        if 'comorbidities' in value and not isinstance(value['comorbidities'], list):
            raise serializers.ValidationError("Comorbidities must be a list.")
        
        # Validate current_medications is a list if provided
        if 'current_medications' in value and not isinstance(value['current_medications'], list):
            raise serializers.ValidationError("Current medications must be a list.")
        
        return value


class MedicineRecommendationSerializer(serializers.ModelSerializer):
    """Serializer for MedicineRecommendation model."""
    
    requested_by_username = serializers.CharField(source='requested_by.username', read_only=True)
    
    class Meta:
        model = MedicineRecommendation
        fields = [
            'id', 'requested_by', 'requested_by_username', 'medicine_name',
            'patient_info', 'alternatives', 'warnings', 'suggestion',
            'created_at', 'response_time_ms'
        ]
        read_only_fields = fields


class MedicineRecommendationResponseSerializer(serializers.Serializer):
    """Serializer for medicine recommendation response."""
    
    id = serializers.IntegerField()
    medicine_name = serializers.CharField()
    alternatives = serializers.ListField(child=serializers.DictField())
    warnings = serializers.ListField(child=serializers.DictField())
    suggestion = serializers.CharField()
    response_time_ms = serializers.IntegerField()
    cached = serializers.BooleanField(default=False)
    note = serializers.CharField(required=False)


class ClearCacheResponseSerializer(serializers.Serializer):
    """Response serializer for cache clearing."""
    message = serializers.CharField()


class RecommendationStatsSerializer(serializers.Serializer):
    """Response serializer for recommendation statistics."""
    total_recommendations = serializers.IntegerField()
    unique_medicines = serializers.IntegerField()
    unique_users = serializers.IntegerField()
    avg_response_time_ms = serializers.FloatField()
    top_medicines = serializers.ListField(child=serializers.DictField())
