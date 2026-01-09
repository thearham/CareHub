"""
Admin configuration for hospitals app.
"""
from django.contrib import admin
from .models import Hospital, Department, HospitalDoctorProfile


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    """Admin for Hospital model."""
    
    list_display = ['name', 'license_number', 'is_approved', 'approved_by', 'created_at']
    list_filter = ['is_approved', 'created_at']
    search_fields = ['name', 'license_number', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at', 'approved_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'license_number')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'address', 'location', 'latitude', 'longitude')
        }),
        ('Approval Status', {
            'fields': ('is_approved', 'approved_by', 'approved_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Admin for Department model."""
    
    list_display = ['name', 'hospital', 'created_at']
    list_filter = ['hospital', 'created_at']
    search_fields = ['name', 'hospital__name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['hospital', 'name']


@admin.register(HospitalDoctorProfile)
class HospitalDoctorProfileAdmin(admin.ModelAdmin):
    """Admin for HospitalDoctorProfile model."""
    
    list_display = ['get_doctor_name', 'hospital', 'specialization', 'is_active', 'created_at']
    list_filter = ['hospital', 'specialization', 'is_active', 'created_at']
    search_fields = [
        'user__first_name', 'user__last_name', 'user__username',
        'hospital__name', 'specialization', 'license_number'
    ]
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Hospital & Doctor', {
            'fields': ('hospital', 'user', 'created_by')
        }),
        ('Professional Information', {
            'fields': ('license_number', 'specialization', 'cnic')
        }),
        ('Contact Information', {
            'fields': ('phone_number', 'address')
        }),
        ('Availability', {
            'fields': ('available_timings', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
