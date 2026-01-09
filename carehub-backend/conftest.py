"""
Pytest configuration and fixtures.
"""
import pytest
from django.contrib.auth import get_user_model
from hospitals.models import Hospital, Department, HospitalDoctorProfile
from accounts.utils import generate_username, generate_strong_password

User = get_user_model()


@pytest.fixture
def api_client():
    """DRF API client."""
    from rest_framework.test import APIClient
    return APIClient()


@pytest.fixture
def admin_user(db):
    """Create admin user."""
    user = User.objects.create_user(
        username='admin_test',
        email='admin@test.com',
        password='testpass123',
        first_name='Admin',
        last_name='Test',
        user_type='ADMIN',
        is_staff=True,
        is_superuser=True
    )
    return user


@pytest.fixture
def patient_user(db):
    """Create patient user."""
    user = User.objects.create_user(
        username='patient_test',
        email='patient@test.com',
        password='testpass123',
        first_name='Patient',
        last_name='Test',
        phone_number='+923001234567',
        user_type='PATIENT'
    )
    return user


@pytest.fixture
def hospital_user(db):
    """Create hospital user."""
    user = User.objects.create_user(
        username='hospital_test',
        email='hospital@test.com',
        password='testpass123',
        first_name='Hospital',
        last_name='Test',
        user_type='HOSPITAL',
        is_active=False
    )
    return user


@pytest.fixture
def approved_hospital(db, hospital_user, admin_user):
    """Create approved hospital."""
    from django.utils import timezone
    
    hospital_user.is_active = True
    hospital_user.save()
    
    hospital = Hospital.objects.create(
        user=hospital_user,
        name='Test Hospital',
        license_number='TEST-LIC-001',
        email='info@testhospital.com',
        phone='+923001234567',
        address='123 Test Street',
        location='Test Location',
        latitude=31.5204,
        longitude=74.3587,
        is_approved=True,
        approved_by=admin_user,
        approved_at=timezone.now()
    )
    return hospital


@pytest.fixture
def department(db, approved_hospital):
    """Create department."""
    return Department.objects.create(
        hospital=approved_hospital,
        name='Cardiology',
        description='Heart care'
    )


@pytest.fixture
def doctor_user(db, approved_hospital):
    """Create doctor user and profile."""
    username = generate_username('Test Doctor', approved_hospital.name)
    password = generate_strong_password()
    
    user = User.objects.create_user(
        username=username,
        email='doctor@test.com',
        password=password,
        first_name='Test',
        last_name='Doctor',
        phone_number='+923009876543',
        user_type='DOCTOR'
    )
    
    profile = HospitalDoctorProfile.objects.create(
        hospital=approved_hospital,
        user=user,
        license_number='DOC-TEST-001',
        specialization='Cardiology',
        phone_number='+923009876543',
        is_active=True
    )
    
    user.doctor_profile = profile
    return user
