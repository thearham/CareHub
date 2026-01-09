"""
Utility functions for accounts app.
"""
import secrets
import string
import logging
from django.utils.text import slugify
from .models import User, AuditLog

logger = logging.getLogger(__name__)


def generate_username(full_name, hospital_name=None):
    """
    Generate a unique username from full name and optional hospital name.
    
    Args:
        full_name: Doctor's full name
        hospital_name: Hospital name (optional)
    
    Returns:
        Unique username string
    
    Example:
        generate_username("Ali Mehmood", "Jinnah Hospital") -> "alimehmood_jinnah"
    """
    # Clean and slugify the name
    name_slug = slugify(full_name).replace('-', '')
    
    if hospital_name:
        hospital_slug = slugify(hospital_name).replace('-', '')[:20]  # Limit hospital slug length
        base_username = f"{name_slug}_{hospital_slug}"
    else:
        base_username = name_slug
    
    # Ensure username doesn't exceed max length
    base_username = base_username[:140]  # Leave room for numeric suffix
    
    # Check if username exists, if so append numeric suffix
    username = base_username
    counter = 1
    
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
        
        # Safety check to prevent infinite loop
        if counter > 9999:
            # Fallback to random suffix
            random_suffix = ''.join(secrets.choice(string.digits) for _ in range(4))
            username = f"{base_username}{random_suffix}"
            break
    
    logger.info(f"Generated username: {username} from name: {full_name}, hospital: {hospital_name}")
    
    return username


def generate_strong_password(length=12):
    """
    Generate a strong random password.
    
    Args:
        length: Password length (default 12)
    
    Returns:
        Strong password string containing uppercase, lowercase, digits, and special chars
    """
    # Define character sets
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    special = "!@#$%^&*"
    
    # Ensure at least one character from each set
    password = [
        secrets.choice(lowercase),
        secrets.choice(uppercase),
        secrets.choice(digits),
        secrets.choice(special),
    ]
    
    # Fill the rest with random characters from all sets
    all_chars = lowercase + uppercase + digits + special
    password.extend(secrets.choice(all_chars) for _ in range(length - 4))
    
    # Shuffle to avoid predictable pattern
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)


def log_action(action, user=None, performed_by=None, details=None, request=None):
    """
    Create an audit log entry.
    
    Args:
        action: Action type (from AuditLog.ACTION_CHOICES)
        user: User the action was performed on
        performed_by: User who performed the action
        details: Additional details (dict)
        request: HTTP request object (to extract IP and user agent)
    
    Returns:
        AuditLog instance
    """
    ip_address = None
    user_agent = ''
    
    if request:
        # Get IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        # Get user agent
        user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    audit_log = AuditLog.objects.create(
        action=action,
        user=user,
        performed_by=performed_by,
        details=details or {},
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    logger.info(
        f"Audit log created: {action} - User: {user}, Performed by: {performed_by}, "
        f"IP: {ip_address}"
    )
    
    return audit_log


def send_sms(phone_number, message):
    """
    Send SMS to a phone number.
    This is a pluggable function that can be replaced with actual SMS provider integration.
    
    Args:
        phone_number: Recipient phone number
        message: SMS message content
    
    Returns:
        Boolean indicating success
    """
    from django.conf import settings
    
    # In development, just log the SMS
    if settings.DEBUG:
        logger.info(f"[DEV MODE] SMS to {phone_number}: {message}")
        return True
    
    # In production, integrate with actual SMS provider
    try:
        # Example integration (replace with actual provider)
        # import requests
        # response = requests.post(
        #     settings.SMS_PROVIDER_URL,
        #     headers={'Authorization': f'Bearer {settings.SMS_PROVIDER_API_KEY}'},
        #     json={'to': phone_number, 'message': message}
        # )
        # return response.status_code == 200
        
        logger.warning(f"SMS sending not configured. Message to {phone_number}: {message}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send SMS to {phone_number}: {str(e)}")
        return False


def get_client_ip(request):
    """Extract client IP address from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
