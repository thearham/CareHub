"""
Admin configuration for appointments app.
"""
from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    """Admin for Appointment model."""
    
    list_display = [
        'id', 'patient', 'hospital', 'department', 'assigned_doctor',
        'status', 'requested_time', 'created_at'
    ]
    list_filter = ['status', 'hospital', 'department', 'created_at']
    search_fields = [
        'patient__username', 'patient__first_name', 'patient__last_name',
        'hospital__name', 'department__name', 'reason'
    ]
    readonly_fields = ['created_at', 'updated_at', 'assigned_at']
    ordering = ['-requested_time']
    
    fieldsets = (
        ('Patient & Hospital', {
            'fields': ('patient', 'hospital', 'department')
        }),
        ('Doctor Assignment', {
            'fields': ('assigned_doctor', 'assigned_by', 'assigned_at')
        }),
        ('Appointment Details', {
            'fields': ('requested_time', 'confirmed_time', 'status', 'reason', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
