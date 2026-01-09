"""
Admin configuration for records app.
"""
from django.contrib import admin
from .models import Prescription, PatientReport, PrescriptionAttachment


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    """Admin for Prescription model."""
    
    list_display = ['id', 'patient', 'doctor', 'diagnosis_short', 'version', 'created_at']
    list_filter = ['created_at', 'doctor__hospital', 'doctor__specialization']
    search_fields = [
        'patient__username', 'patient__first_name', 'patient__last_name',
        'doctor__user__username', 'diagnosis', 'treatment_plan'
    ]
    readonly_fields = ['created_at', 'updated_at', 'version', 'previous_version']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Patient & Doctor', {
            'fields': ('appointment', 'patient', 'doctor')
        }),
        ('Clinical Information', {
            'fields': ('diagnosis', 'investigations', 'treatment_plan', 'medicines')
        }),
        ('Follow-up & Referral', {
            'fields': ('follow_up_date', 'referral_notes', 'doctor_notes')
        }),
        ('Versioning', {
            'fields': ('version', 'previous_version')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def diagnosis_short(self, obj):
        """Return shortened diagnosis."""
        return obj.diagnosis[:50] + '...' if len(obj.diagnosis) > 50 else obj.diagnosis
    diagnosis_short.short_description = 'Diagnosis'


@admin.register(PatientReport)
class PatientReportAdmin(admin.ModelAdmin):
    """Admin for PatientReport model."""
    
    list_display = ['id', 'title', 'patient', 'file_type', 'hospital', 'uploaded_at']
    list_filter = ['file_type', 'uploaded_at', 'hospital']
    search_fields = [
        'title', 'description', 'patient__username',
        'patient__first_name', 'patient__last_name'
    ]
    readonly_fields = ['file_size', 'uploaded_at', 'updated_at']
    ordering = ['-uploaded_at']
    
    fieldsets = (
        ('Patient & Hospital', {
            'fields': ('patient', 'hospital', 'uploaded_by')
        }),
        ('Report Details', {
            'fields': ('title', 'description', 'file_type', 'report_date')
        }),
        ('File Information', {
            'fields': ('file', 'file_size')
        }),
        ('Timestamps', {
            'fields': ('uploaded_at', 'updated_at')
        }),
    )


@admin.register(PrescriptionAttachment)
class PrescriptionAttachmentAdmin(admin.ModelAdmin):
    """Admin for PrescriptionAttachment model."""
    
    list_display = ['id', 'prescription', 'file_name', 'file_size', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['file_name', 'description', 'prescription__patient__username']
    readonly_fields = ['file_name', 'file_size', 'uploaded_at']
    ordering = ['-uploaded_at']
