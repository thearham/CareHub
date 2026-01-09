"""
URL configuration for appointments app.
"""
from django.urls import path
from .views import (
    CreateAppointmentView,
    PatientAppointmentListView,
    HospitalAppointmentListView,
    DoctorAppointmentListView,
    AppointmentDetailView,
    AssignDoctorView,
    UpdateAppointmentStatusView,
    CancelAppointmentView,
)

app_name = 'appointments'

urlpatterns = [
    # Create appointment
    path('', CreateAppointmentView.as_view(), name='create-appointment'),
    
    # List appointments by user type
    path('my-appointments/', PatientAppointmentListView.as_view(), name='patient-appointments'),
    path('hospital-appointments/', HospitalAppointmentListView.as_view(), name='hospital-appointments'),
    path('doctor-appointments/', DoctorAppointmentListView.as_view(), name='doctor-appointments'),
    
    # Appointment details and actions
    path('<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('<int:pk>/assign-doctor/', AssignDoctorView.as_view(), name='assign-doctor'),
    path('<int:pk>/status/', UpdateAppointmentStatusView.as_view(), name='update-status'),
    path('<int:pk>/cancel/', CancelAppointmentView.as_view(), name='cancel-appointment'),
]
