"""
Service module for medicine recommendations using GROQ.
"""
import json
import logging
import time
from pathlib import Path
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


def query_medical_data_groq(query):
    """
    Query medical database/dataset using GROQ.
    
    This is a placeholder function that should be implemented with actual
    GROQ query logic against a medical database.
    
    Args:
        query: GROQ query string
    
    Returns:
        dict: Query results from medical database
    
    Example implementation:
        from groq import Client
        client = Client(api_key=settings.GROQ_API_KEY)
        # Execute GROQ query against medical dataset
        results = client.query(query)
        return results
    """
    # Placeholder implementation
    # In production, this would query an actual medical database using GROQ
    logger.info(f"GROQ Query: {query}")
    
    # Mock response for development
    return {
        "medicine_info": {
            "name": query,
            "category": "Analgesic",
            "active_ingredient": "Paracetamol",
            "common_uses": ["Pain relief", "Fever reduction"]
        },
        "alternatives": [
            {
                "name": "Ibuprofen",
                "active_ingredient": "Ibuprofen",
                "similarity_score": 0.85
            },
            {
                "name": "Aspirin",
                "active_ingredient": "Acetylsalicylic acid",
                "similarity_score": 0.75
            }
        ],
        "contraindications": [
            "Liver disease",
            "Alcohol consumption",
            "Pregnancy (third trimester)"
        ]
    }


def get_medicine_recommendations(medicine_name: str, patient_info: dict = None):
    """
    Get medicine recommendations using GROQ LLM.
    
    Args:
        medicine_name: Name of the medicine to get alternatives for
        patient_info: Dictionary containing patient information
            - age: Patient age
            - allergies: List of known allergies
            - comorbidities: List of existing conditions
            - current_medications: List of current medications
    
    Returns:
        dict: Structured recommendation response
            - alternatives: List of alternative medicines
            - warnings: List of warnings and contraindications
            - suggestion: General recommendation
    
    Raises:
        Exception: If GROQ API call fails
    """
    start_time = time.time()
    
    # Normalize inputs
    medicine_name = medicine_name.strip()
    patient_info = patient_info or {}
    
    # Check cache first
    cache_key = f"med_rec_{medicine_name}_{json.dumps(patient_info, sort_keys=True)}"
    cached_result = cache.get(cache_key)
    if cached_result:
        logger.info(f"Returning cached recommendation for {medicine_name}")
        return cached_result
    
    try:
        # Step 1: Query medical data using GROQ
        groq_query = f"medicine.name == '{medicine_name}' || medicine.active_ingredient match '{medicine_name}'"
        medical_data = query_medical_data_groq(groq_query)
        
        # Step 2: Load system prompt template
        prompt_path = Path(__file__).parent / 'system_prompt.txt'
        with open(prompt_path, 'r') as f:
            system_prompt_template = f.read()
        
        # Step 3: Format system prompt with data
        system_prompt = system_prompt_template.format(
            medical_data=json.dumps(medical_data, indent=2),
            patient_info=json.dumps(patient_info, indent=2),
            medicine_name=medicine_name
        )
        
        # Step 4: Call GROQ LLM
        groq_api_key = settings.GROQ_API_KEY
        
        if not groq_api_key:
            logger.warning("GROQ_API_KEY not configured, returning mock response")
            return _get_mock_recommendation(medicine_name, patient_info, medical_data)
        
        # Import GROQ client
        try:
            from groq import Groq
            
            client = Groq(api_key=groq_api_key)
            
            # Make LLM request
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": f"Provide medicine recommendations for {medicine_name}"
                    }
                ],
                model="mixtral-8x7b-32768",  # or another GROQ model
                temperature=0.3,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Parse response
            response_content = chat_completion.choices[0].message.content
            recommendation = json.loads(response_content)
            
        except ImportError:
            logger.error("GROQ library not installed. Install with: pip install groq")
            return _get_mock_recommendation(medicine_name, patient_info, medical_data)
        except Exception as e:
            logger.error(f"GROQ LLM call failed: {str(e)}")
            return _get_mock_recommendation(medicine_name, patient_info, medical_data)
        
        # Step 5: Validate and normalize response
        normalized_response = {
            "alternatives": recommendation.get("alternatives", []),
            "warnings": recommendation.get("warnings", []),
            "suggestion": recommendation.get("suggestion", "Please consult a healthcare professional.")
        }
        
        # Calculate response time
        response_time_ms = int((time.time() - start_time) * 1000)
        normalized_response['response_time_ms'] = response_time_ms
        
        # Cache the result for 1 hour
        cache.set(cache_key, normalized_response, 3600)
        
        logger.info(f"Generated recommendation for {medicine_name} in {response_time_ms}ms")
        
        return normalized_response
        
    except Exception as e:
        logger.error(f"Error generating medicine recommendation: {str(e)}")
        raise


def _get_mock_recommendation(medicine_name: str, patient_info: dict, medical_data: dict):
    """
    Generate a mock recommendation for development/testing.
    
    Args:
        medicine_name: Medicine name
        patient_info: Patient information
        medical_data: Medical data from GROQ query
    
    Returns:
        dict: Mock recommendation response
    """
    alternatives = []
    
    # Extract alternatives from medical data
    if 'alternatives' in medical_data:
        for alt in medical_data['alternatives'][:3]:
            alternatives.append({
                "name": alt.get('name', 'Unknown'),
                "reason": f"Similar therapeutic effect to {medicine_name}",
                "notes": f"Active ingredient: {alt.get('active_ingredient', 'N/A')}"
            })
    
    # Generate warnings based on patient info and contraindications
    warnings = []
    
    if 'contraindications' in medical_data:
        for contraindication in medical_data['contraindications']:
            warnings.append({
                "condition": contraindication,
                "message": f"Use with caution if patient has {contraindication}",
                "severity": "MODERATE"
            })
    
    # Check patient allergies
    if patient_info.get('allergies'):
        warnings.append({
            "condition": "Known allergies",
            "message": f"Patient has allergies to: {', '.join(patient_info['allergies'])}. Verify no cross-reactivity.",
            "severity": "HIGH"
        })
    
    # Check patient age
    age = patient_info.get('age')
    if age:
        if age < 12:
            warnings.append({
                "condition": "Pediatric patient",
                "message": "Dosage adjustment required for pediatric patients",
                "severity": "HIGH"
            })
        elif age > 65:
            warnings.append({
                "condition": "Elderly patient",
                "message": "Consider reduced dosage for elderly patients",
                "severity": "MODERATE"
            })
    
    return {
        "alternatives": alternatives,
        "warnings": warnings,
        "suggestion": (
            f"Based on the available data, there are {len(alternatives)} alternative medicines "
            f"for {medicine_name}. Please consult with a healthcare professional before making "
            "any changes to medication. This recommendation is for informational purposes only."
        ),
        "response_time_ms": 50,
        "note": "This is a mock response for development. Configure GROQ_API_KEY for real recommendations."
    }


def clear_recommendation_cache():
    """Clear all cached medicine recommendations."""
    # This is a simplified version. In production, you'd want to track cache keys
    logger.info("Clearing medicine recommendation cache")
    cache.clear()
