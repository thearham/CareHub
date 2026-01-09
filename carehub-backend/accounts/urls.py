"""
URL configuration for accounts app.
"""
from django.urls import path
from .views import (
    PatientRegistrationView,
    CurrentUserView,
    ChangePasswordView,
    OTPGenerateView,
    OTPVerifyView,
    UserListView,
    dashboard_stats,
)

app_name = 'accounts'

urlpatterns = [
    # User management
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    # Patient registration
    path('patients/register/', PatientRegistrationView.as_view(), name='patient-register'),
    
    # OTP endpoints
    path('otp/generate/', OTPGenerateView.as_view(), name='otp-generate'),
    path('otp/verify/', OTPVerifyView.as_view(), name='otp-verify'),
    
    # Admin dashboard
    path('dashboard-stats/', dashboard_stats, name='dashboard-stats'),
]
