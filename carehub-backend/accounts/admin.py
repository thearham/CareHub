"""
Admin configuration for accounts app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTP, AuditLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for User model."""
    
    list_display = ['username', 'email', 'user_type', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['user_type', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'phone_number')}),
        ('User Type', {'fields': ('user_type',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'user_type', 'is_active', 'is_staff'),
        }),
    )


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    """Admin for OTP model."""
    
    list_display = ['phone_number', 'user', 'created_at', 'expires_at', 'is_used', 'requested_by']
    list_filter = ['is_used', 'created_at', 'expires_at']
    search_fields = ['phone_number', 'user__username', 'user__email']
    readonly_fields = ['code_hash', 'created_at', 'used_at']
    ordering = ['-created_at']
    
    def has_add_permission(self, request):
        """Disable manual OTP creation through admin."""
        return False


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Admin for AuditLog model."""
    
    list_display = ['action', 'user', 'performed_by', 'timestamp', 'ip_address']
    list_filter = ['action', 'timestamp']
    search_fields = ['user__username', 'performed_by__username', 'details']
    readonly_fields = ['action', 'user', 'performed_by', 'details', 'ip_address', 'user_agent', 'timestamp']
    ordering = ['-timestamp']
    
    def has_add_permission(self, request):
        """Disable manual audit log creation through admin."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Disable audit log deletion through admin."""
        return False
