"""
Custom permissions for hospitals app.
"""
from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Permission for admin users only."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'ADMIN'


class IsHospitalUser(permissions.BasePermission):
    """Permission for hospital users only."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'HOSPITAL'


class IsDoctorUser(permissions.BasePermission):
    """Permission for doctor users only."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'DOCTOR'


class IsPatientUser(permissions.BasePermission):
    """Permission for patient users only."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'PATIENT'


class IsHospitalOrAdmin(permissions.BasePermission):
    """Permission for hospital or admin users."""
    
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type in ['HOSPITAL', 'ADMIN']
        )
