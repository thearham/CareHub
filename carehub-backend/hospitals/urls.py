"""
URL configuration for hospitals app.
"""
from django.urls import path
from .views import (
    HospitalRegistrationView,
    HospitalListView,
    HospitalDetailView,
    HospitalApprovalView,
    DepartmentListCreateView,
    DepartmentDetailView,
    CreateDoctorView,
    HospitalDoctorListView,
    HospitalDoctorDetailView,
    NearbyHospitalsView,
)

app_name = 'hospitals'

urlpatterns = [
    # Hospital management
    path('register/', HospitalRegistrationView.as_view(), name='hospital-register'),
    path('', HospitalListView.as_view(), name='hospital-list'),
    path('<int:pk>/', HospitalDetailView.as_view(), name='hospital-detail'),
    path('<int:pk>/approve/', HospitalApprovalView.as_view(), name='hospital-approve'),
    path('nearby/', NearbyHospitalsView.as_view(), name='nearby-hospitals'),
    
    # Department management
    path('departments/', DepartmentListCreateView.as_view(), name='department-list-create'),
    path('departments/<int:pk>/', DepartmentDetailView.as_view(), name='department-detail'),
    
    # Doctor management
    path('doctors/create/', CreateDoctorView.as_view(), name='create-doctor'),
    path('doctors/', HospitalDoctorListView.as_view(), name='doctor-list'),
    path('doctors/<int:pk>/', HospitalDoctorDetailView.as_view(), name='doctor-detail'),
]
