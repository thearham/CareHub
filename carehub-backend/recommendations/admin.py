"""
Admin configuration for recommendations app.
"""
from django.contrib import admin
from .models import MedicineRecommendation


@admin.register(MedicineRecommendation)
class MedicineRecommendationAdmin(admin.ModelAdmin):
    """Admin for MedicineRecommendation model."""
    
    list_display = ['id', 'medicine_name', 'requested_by', 'created_at', 'response_time_ms']
    list_filter = ['created_at']
    search_fields = ['medicine_name', 'requested_by__username', 'requested_by__email']
    readonly_fields = ['created_at', 'response_time_ms']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Request Information', {
            'fields': ('requested_by', 'medicine_name', 'patient_info')
        }),
        ('Recommendation', {
            'fields': ('alternatives', 'warnings', 'suggestion')
        }),
        ('Metadata', {
            'fields': ('created_at', 'response_time_ms')
        }),
    )
