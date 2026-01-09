"""
Core flow tests for CareHub.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from accounts.models import User, OTP
from hospitals.models import Hospital, HospitalDoctorProfile
from appointments.models import Appointment


@pytest.mark.django_db
class TestHospitalRegistrationAndApproval:
    """Test hospital registration and approval flow."""
    
    def test_hospital_registration(self, api_client):
        """Test hospital can register."""
        url = reverse('hospitals:hospital-register')
        data = {
            'username': 'newhospital',
            'email': 'new@hospital.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
            'first_name': 'New',
            'last_name': 'Hospital',
            'phone_number': '+923001234567',
            'hospital_name': 'New Hospital',
            'license_number': 'NEW-LIC-001',
            'hospital_email': 'info@newhospital.com',
            'hospital_phone': '+923001234567',
            'address': '123 Hospital Street',
            'location': 'Medical District',
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'hospital' in response.data
        
        # Verify hospital is not approved
        hospital = Hospital.objects.get(license_number='NEW-LIC-001')
        assert hospital.is_approved is False
        assert hospital.user.is_active is False
    
    def test_admin_approves_hospital(self, api_client, admin_user, hospital_user):
        """Test admin can approve hospital."""
        # Create hospital
        hospital = Hospital.objects.create(
            user=hospital_user,
            name='Test Hospital',
            license_number='TEST-001',
            email='test@hospital.com',
            phone='+923001234567',
            address='Test Address',
            location='Test Location',
            is_approved=False
        )
        
        # Login as admin
        api_client.force_authenticate(user=admin_user)
        
        url = reverse('hospitals:hospital-approve', kwargs={'pk': hospital.id})
        data = {'is_approved': True}
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify hospital is approved
        hospital.refresh_from_db()
        assert hospital.is_approved is True
        assert hospital.user.is_active is True


@pytest.mark.django_db
class TestDoctorCreation:
    """Test hospital creates doctor with returned password."""
    
    def test_hospital_creates_doctor(self, api_client, approved_hospital):
        """Test hospital can create doctor and receives credentials."""
        api_client.force_authenticate(user=approved_hospital.user)
        
        url = reverse('hospitals:create-doctor')
        data = {
            'first_name': 'John',
            'last_name': 'Smith',
            'email': 'john.smith@hospital.com',
            'phone_number': '+923009876543',
            'license_number': 'DOC-001',
            'specialization': 'Cardiology',
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'credentials' in response.data
        assert 'username' in response.data['credentials']
        assert 'password' in response.data['credentials']
        
        # Verify username format
        username = response.data['credentials']['username']
        assert 'johnsmith' in username.lower()
        
        # Verify doctor can login with returned credentials
        doctor_user = User.objects.get(username=username)
        assert doctor_user.user_type == 'DOCTOR'
        assert doctor_user.check_password(response.data['credentials']['password'])


@pytest.mark.django_db
class TestDoctorLogin:
    """Test doctor login with username and password."""
    
    def test_doctor_login(self, api_client, doctor_user):
        """Test doctor can login with username/password."""
        url = reverse('token_obtain_pair')
        data = {
            'username': doctor_user.username,
            'password': 'testpass123'  # Set in fixture
        }
        
        # Need to set password explicitly for test
        doctor_user.set_password('testpass123')
        doctor_user.save()
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data


@pytest.mark.django_db
class TestOTPFlow:
    """Test OTP generation and verification."""
    
    def test_otp_generation(self, api_client, doctor_user, patient_user):
        """Test doctor can request OTP for patient."""
        api_client.force_authenticate(user=doctor_user)
        
        url = reverse('accounts:otp-generate')
        data = {
            'patient_phone': patient_user.phone_number,
            'patient_id': patient_user.id
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'message' in response.data
        
        # Verify OTP was created
        otp = OTP.objects.filter(user=patient_user).first()
        assert otp is not None
        assert otp.requested_by == doctor_user
    
    def test_otp_verification(self, api_client, doctor_user, patient_user):
        """Test OTP verification."""
        # Create OTP
        otp, plain_code = OTP.create_otp(
            user=patient_user,
            phone_number=patient_user.phone_number,
            requested_by=doctor_user
        )
        
        api_client.force_authenticate(user=doctor_user)
        
        url = reverse('accounts:otp-verify')
        data = {
            'patient_phone': patient_user.phone_number,
            'otp': plain_code
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['verified'] is True
        
        # Verify OTP is marked as used
        otp.refresh_from_db()
        assert otp.is_used is True


@pytest.mark.django_db
class TestAppointmentFlow:
    """Test appointment booking and assignment."""
    
    def test_patient_books_appointment(self, api_client, patient_user, approved_hospital, department):
        """Test patient can book appointment."""
        from django.utils import timezone
        from datetime import timedelta
        
        api_client.force_authenticate(user=patient_user)
        
        url = reverse('appointments:create-appointment')
        data = {
            'hospital': approved_hospital.id,
            'department': department.id,
            'requested_time': (timezone.now() + timedelta(days=2)).isoformat(),
            'reason': 'Routine checkup'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['appointment']['status'] == 'REQUESTED'
    
    def test_hospital_assigns_doctor(self, api_client, approved_hospital, patient_user, department, doctor_user):
        """Test hospital can assign doctor to appointment."""
        from django.utils import timezone
        from datetime import timedelta
        
        # Create appointment
        appointment = Appointment.objects.create(
            patient=patient_user,
            hospital=approved_hospital,
            department=department,
            requested_time=timezone.now() + timedelta(days=2),
            status='REQUESTED',
            reason='Test appointment'
        )
        
        api_client.force_authenticate(user=approved_hospital.user)
        
        url = reverse('appointments:assign-doctor', kwargs={'pk': appointment.id})
        data = {
            'doctor_id': doctor_user.doctor_profile.id,
            'confirmed_time': (timezone.now() + timedelta(days=2)).isoformat()
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify doctor is assigned
        appointment.refresh_from_db()
        assert appointment.assigned_doctor == doctor_user.doctor_profile
        assert appointment.status == 'CONFIRMED'


@pytest.mark.django_db
class TestPatientReportUpload:
    """Test patient report upload."""
    
    def test_patient_uploads_report(self, api_client, patient_user):
        """Test patient can upload medical report."""
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        api_client.force_authenticate(user=patient_user)
        
        # Create a dummy file
        file_content = b'PDF content here'
        uploaded_file = SimpleUploadedFile("test_report.pdf", file_content, content_type="application/pdf")
        
        url = reverse('records:upload-report', kwargs={'patient_id': patient_user.id})
        data = {
            'file': uploaded_file,
            'file_type': 'LAB',
            'title': 'Blood Test Results',
            'description': 'Routine blood work'
        }
        
        response = api_client.post(url, data, format='multipart')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'report' in response.data


@pytest.mark.django_db
class TestUsernameGeneration:
    """Test username generation for doctors."""
    
    def test_username_generation(self):
        """Test username is generated correctly."""
        from accounts.utils import generate_username
        
        username = generate_username('Ali Mehmood', 'Jinnah Hospital')
        assert 'alimehmood' in username
        assert 'jinnah' in username
    
    def test_username_uniqueness(self, db):
        """Test username generation handles duplicates."""
        from accounts.utils import generate_username
        
        # Create first user
        User.objects.create_user(
            username='alimehmood_jinnah',
            email='ali1@test.com',
            password='test123',
            user_type='DOCTOR'
        )
        
        # Generate username for same name/hospital
        username = generate_username('Ali Mehmood', 'Jinnah Hospital')
        
        # Should have numeric suffix
        assert username != 'alimehmood_jinnah'
        assert 'alimehmood_jinnah' in username
