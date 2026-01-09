"""
Management command to create demo data for CareHub.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from hospitals.models import Hospital, Department, HospitalDoctorProfile
from appointments.models import Appointment
from accounts.utils import generate_username, generate_strong_password


class Command(BaseCommand):
    help = 'Create demo data for CareHub (admin, hospital, departments, patient)'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing demo data before creating new',
        )
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating demo data...'))
        
        if options['clear']:
            self.stdout.write('Clearing existing demo data...')
            # Be careful with this in production!
            User.objects.filter(username__startswith='demo_').delete()
            Hospital.objects.filter(name__contains='Demo').delete()
        
        # Create Admin User
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@carehub.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'user_type': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created admin user: admin / admin123'))
        else:
            self.stdout.write(self.style.WARNING(f'Admin user already exists'))
        
        # Create Hospital User (Unapproved)
        hospital_user, created = User.objects.get_or_create(
            username='demo_hospital',
            defaults={
                'email': 'hospital@demo.com',
                'first_name': 'Demo',
                'last_name': 'Hospital',
                'phone_number': '+923001234567',
                'user_type': 'HOSPITAL',
                'is_active': False,  # Unapproved
            }
        )
        if created:
            hospital_user.set_password('hospital123')
            hospital_user.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created hospital user: demo_hospital / hospital123 (UNAPPROVED)'))
        else:
            self.stdout.write(self.style.WARNING(f'Hospital user already exists'))
        
        # Create Hospital Profile
        hospital, created = Hospital.objects.get_or_create(
            user=hospital_user,
            defaults={
                'name': 'Demo General Hospital',
                'license_number': 'DEMO-LIC-001',
                'email': 'info@demohospital.com',
                'phone': '+923001234567',
                'address': '123 Medical Street, Healthcare City',
                'location': 'Downtown Medical District',
                'latitude': 31.5204,
                'longitude': 74.3587,
                'is_approved': False,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created hospital: {hospital.name}'))
        else:
            self.stdout.write(self.style.WARNING(f'Hospital already exists'))
        
        # Create Approved Hospital
        approved_hospital_user, created = User.objects.get_or_create(
            username='jinnah_hospital',
            defaults={
                'email': 'admin@jinnah.com',
                'first_name': 'Jinnah',
                'last_name': 'Hospital',
                'phone_number': '+923009876543',
                'user_type': 'HOSPITAL',
                'is_active': True,
            }
        )
        if created:
            approved_hospital_user.set_password('jinnah123')
            approved_hospital_user.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created approved hospital user: jinnah_hospital / jinnah123'))
        
        approved_hospital, created = Hospital.objects.get_or_create(
            user=approved_hospital_user,
            defaults={
                'name': 'Jinnah Hospital',
                'license_number': 'JH-LIC-2024',
                'email': 'info@jinnah.com',
                'phone': '+923009876543',
                'address': '456 Hospital Road, Medical City',
                'location': 'Central Medical District',
                'latitude': 31.5656,
                'longitude': 74.3242,
                'is_approved': True,
                'approved_by': admin_user,
                'approved_at': timezone.now(),
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created approved hospital: {approved_hospital.name}'))
        
        # Create Departments for Approved Hospital
        departments_data = [
            {'name': 'Cardiology', 'description': 'Heart and cardiovascular care'},
            {'name': 'Neurology', 'description': 'Brain and nervous system care'},
            {'name': 'Orthopedics', 'description': 'Bone and joint care'},
            {'name': 'Pediatrics', 'description': 'Child healthcare'},
        ]
        
        for dept_data in departments_data:
            dept, created = Department.objects.get_or_create(
                hospital=approved_hospital,
                name=dept_data['name'],
                defaults={'description': dept_data['description']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created department: {dept.name}'))
        
        # Create Doctor
        doctor_username = generate_username('Ali Mehmood', approved_hospital.name)
        doctor_password = generate_strong_password()
        
        doctor_user, created = User.objects.get_or_create(
            username=doctor_username,
            defaults={
                'email': 'ali.mehmood@jinnah.com',
                'first_name': 'Ali',
                'last_name': 'Mehmood',
                'phone_number': '+923001112233',
                'user_type': 'DOCTOR',
                'is_active': True,
            }
        )
        if created:
            doctor_user.set_password(doctor_password)
            doctor_user.save()
            self.stdout.write(self.style.SUCCESS(
                f'✓ Created doctor: {doctor_username} / {doctor_password}'
            ))
        
        doctor_profile, created = HospitalDoctorProfile.objects.get_or_create(
            hospital=approved_hospital,
            user=doctor_user,
            defaults={
                'cnic': '12345-6789012-3',
                'address': '789 Doctor Street',
                'license_number': 'DOC-LIC-001',
                'specialization': 'Cardiology',
                'phone_number': '+923001112233',
                'available_timings': {
                    'monday': ['09:00-13:00', '14:00-18:00'],
                    'wednesday': ['09:00-13:00', '14:00-18:00'],
                    'friday': ['09:00-13:00'],
                },
                'is_active': True,
                'created_by': approved_hospital_user,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'  ✓ Created doctor profile for Dr. {doctor_user.get_full_name()}'))
        
        # Create Patient
        patient_user, created = User.objects.get_or_create(
            username='demo_patient',
            defaults={
                'email': 'patient@demo.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'phone_number': '+923005556677',
                'user_type': 'PATIENT',
                'is_active': True,
            }
        )
        if created:
            patient_user.set_password('patient123')
            patient_user.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created patient: demo_patient / patient123'))
        
        # Create Sample Appointment
        cardiology_dept = Department.objects.filter(
            hospital=approved_hospital,
            name='Cardiology'
        ).first()
        
        if cardiology_dept:
            appointment, created = Appointment.objects.get_or_create(
                patient=patient_user,
                hospital=approved_hospital,
                department=cardiology_dept,
                defaults={
                    'requested_time': timezone.now() + timedelta(days=3),
                    'status': 'REQUESTED',
                    'reason': 'Routine checkup for chest pain',
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created sample appointment'))
        
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('Demo data created successfully!'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write('\nDemo Credentials:')
        self.stdout.write(f'  Admin:    admin / admin123')
        self.stdout.write(f'  Hospital: jinnah_hospital / jinnah123 (APPROVED)')
        self.stdout.write(f'  Hospital: demo_hospital / hospital123 (UNAPPROVED)')
        self.stdout.write(f'  Doctor:   {doctor_username} / {doctor_password if created else "[check logs]"}')
        self.stdout.write(f'  Patient:  demo_patient / patient123')
        self.stdout.write('\nNext steps:')
        self.stdout.write('  1. Run: python manage.py runserver')
        self.stdout.write('  2. Login as admin to approve demo_hospital')
        self.stdout.write('  3. Test different user flows')
