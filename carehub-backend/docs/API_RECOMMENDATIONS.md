# Medicine Recommendations API Documentation

## Base URL
```
http://localhost:8000/api/recommendations
```

---

## 1. Get Medicine Recommendation

**Endpoint:** `POST /`  
**Authentication:** Required  
**Rate Limit:** 10 requests per hour per user  
**Description:** Get AI-powered medicine recommendations using GROQ LLM

### Request Body
```json
{
  "medicine_name": "Paracetamol",
  "patient_info": {
    "age": 35,
    "gender": "male",
    "weight": 75,
    "allergies": ["penicillin", "sulfa drugs"],
    "comorbidities": ["hypertension", "diabetes"],
    "current_medications": ["Metformin", "Amlodipine"]
  }
}
```

### Patient Info Fields (All Optional)
- `age`: Integer (0-150)
- `gender`: String
- `weight`: Number (kg)
- `allergies`: Array of strings
- `comorbidities`: Array of strings
- `current_medications`: Array of strings

### Success Response (200 OK)
```json
{
  "id": 1,
  "medicine_name": "Paracetamol",
  "alternatives": [
    {
      "name": "Ibuprofen",
      "reason": "Similar pain relief properties with anti-inflammatory effects",
      "precautions": "Take with food to avoid stomach upset"
    },
    {
      "name": "Acetaminophen",
      "reason": "Same active ingredient, different brand",
      "precautions": "Do not exceed 4000mg per day"
    }
  ],
  "warnings": [
    {
      "type": "Drug Interaction",
      "severity": "Moderate",
      "description": "May interact with blood thinners. Consult doctor if taking anticoagulants."
    },
    {
      "type": "Allergy Alert",
      "severity": "High",
      "description": "Patient has sulfa drug allergy. Ensure no cross-reactivity."
    }
  ],
  "suggestion": "Paracetamol is generally safe for this patient profile. Recommended dosage: 500-1000mg every 4-6 hours, not exceeding 4000mg per day. Monitor liver function if used long-term. Consider alternatives if pain persists beyond 3 days.",
  "response_time_ms": 1234,
  "cached": false,
  "note": "This recommendation is AI-generated and should not replace professional medical advice."
}
```

### Error Responses

**400 Bad Request - Validation Errors**
```json
{
  "medicine_name": ["Medicine name cannot be empty."],
  "patient_info": ["Patient info must be a dictionary."],
  "patient_info": ["Invalid field 'height' in patient_info. Allowed fields: age, allergies, comorbidities, current_medications, gender, weight"],
  "patient_info": ["Age must be between 0 and 150."],
  "patient_info": ["Allergies must be a list."]
}
```

**429 Too Many Requests**
```json
{
  "detail": "Request was throttled. Expected available in 3456 seconds."
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to generate medicine recommendation",
  "detail": "Internal server error"
}
```

### Validation Rules
- `medicine_name`: Required, non-empty string, max 255 characters
- `patient_info`: Optional, must be a dictionary
- Allowed patient_info fields: age, allergies, comorbidities, current_medications, gender, weight
- `age`: Must be integer between 0 and 150
- `allergies`: Must be array of strings
- `comorbidities`: Must be array of strings
- `current_medications`: Must be array of strings

### Caching
- Responses are cached based on medicine name and patient info
- Cache key: `med_rec_{medicine_name}_{patient_info_json}`
- Cached responses return faster with `cached: true`

---

## 2. Get Recommendation History

**Endpoint:** `GET /history/`  
**Authentication:** Required  
**Description:** Get recommendation history for authenticated user

### Query Parameters
- `page`: Page number (default: 1)

### Success Response (200 OK)
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/recommendations/history/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "requested_by": 10,
      "requested_by_username": "dr_ali",
      "medicine_name": "Paracetamol",
      "patient_info": {
        "age": 35,
        "gender": "male",
        "allergies": ["penicillin"]
      },
      "alternatives": [
        {
          "name": "Ibuprofen",
          "reason": "Similar pain relief properties"
        }
      ],
      "warnings": [
        {
          "type": "Drug Interaction",
          "severity": "Moderate",
          "description": "May interact with blood thinners"
        }
      ],
      "suggestion": "Paracetamol is generally safe for this patient profile...",
      "created_at": "2025-10-30T00:00:00Z",
      "response_time_ms": 1234
    }
  ]
}
```

---

## 3. Get Specific Recommendation

**Endpoint:** `GET /{id}/`  
**Authentication:** Required  
**Description:** Get details of a specific recommendation

### Success Response (200 OK)
```json
{
  "id": 1,
  "requested_by": 10,
  "requested_by_username": "dr_ali",
  "medicine_name": "Paracetamol",
  "patient_info": {
    "age": 35,
    "gender": "male",
    "weight": 75,
    "allergies": ["penicillin", "sulfa drugs"],
    "comorbidities": ["hypertension", "diabetes"],
    "current_medications": ["Metformin", "Amlodipine"]
  },
  "alternatives": [
    {
      "name": "Ibuprofen",
      "reason": "Similar pain relief properties with anti-inflammatory effects",
      "precautions": "Take with food to avoid stomach upset"
    }
  ],
  "warnings": [
    {
      "type": "Drug Interaction",
      "severity": "Moderate",
      "description": "May interact with blood thinners. Consult doctor if taking anticoagulants."
    }
  ],
  "suggestion": "Paracetamol is generally safe for this patient profile. Recommended dosage: 500-1000mg every 4-6 hours...",
  "created_at": "2025-10-30T00:00:00Z",
  "response_time_ms": 1234
}
```

### Error Responses

**404 Not Found**
```json
{
  "detail": "Not found."
}
```

### Access Control
- Users can view their own recommendations
- Admin can view all recommendations

---

## 4. Clear Cache (Admin Only)

**Endpoint:** `POST /clear-cache/`  
**Authentication:** Required (Admin only)  
**Description:** Clear medicine recommendation cache

### Success Response (200 OK)
```json
{
  "message": "Cache cleared successfully"
}
```

### Error Responses

**403 Forbidden**
```json
{
  "error": "Only admins can clear the cache"
}
```

---

## 5. Get Statistics (Admin Only)

**Endpoint:** `GET /stats/`  
**Authentication:** Required (Admin only)  
**Description:** Get recommendation usage statistics

### Success Response (200 OK)
```json
{
  "total_recommendations": 1500,
  "unique_medicines": 250,
  "unique_users": 45,
  "avg_response_time_ms": 1456.78,
  "top_medicines": [
    {
      "medicine_name": "Paracetamol",
      "count": 150
    },
    {
      "medicine_name": "Ibuprofen",
      "count": 120
    },
    {
      "medicine_name": "Amoxicillin",
      "count": 95
    },
    {
      "medicine_name": "Metformin",
      "count": 80
    },
    {
      "medicine_name": "Amlodipine",
      "count": 75
    }
  ]
}
```

### Error Responses

**403 Forbidden**
```json
{
  "error": "Only admins can view statistics"
}
```

---

## Rate Limiting

### Limits
- **10 requests per hour per user** for medicine recommendations
- Rate limit is per authenticated user
- Resets every hour

### Rate Limit Headers
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1698624000
```

### When Rate Limited
```json
{
  "detail": "Request was throttled. Expected available in 3456 seconds."
}
```

**Retry After:** Check the `Retry-After` header or calculate from the error message

---

## GROQ LLM Configuration

### Environment Variables
```env
GROQ_API_KEY=your_groq_api_key_here
```

### Model Details
- **Provider:** GROQ
- **Purpose:** Generate medicine recommendations, alternatives, and warnings
- **Response Format:** Structured JSON with alternatives, warnings, and suggestions

### Important Notes
1. **Not a Replacement for Medical Advice:** All recommendations include disclaimer
2. **AI-Generated:** Responses are generated by AI and may not be 100% accurate
3. **Professional Consultation:** Always recommend consulting healthcare professionals
4. **Liability:** System provides information only, not medical diagnosis or treatment

---

## Notes for Frontend Integration

1. **Rate Limiting Display:**
   - Show remaining requests in UI
   - Display countdown timer until reset
   - Disable submit button when limit reached
   - Show clear error message with retry time

2. **Patient Info Form:**
   - Make all patient info fields optional
   - Provide clear labels and help text
   - Use number inputs for age and weight
   - Use multi-select or tag input for allergies, comorbidities, medications
   - Validate age range (0-150)

3. **Loading States:**
   - Show loading spinner during API call
   - Display "Generating recommendations..." message
   - Show response time after completion
   - Indicate if response was cached

4. **Response Display:**
   - **Alternatives:** Display as cards or list with name, reason, and precautions
   - **Warnings:** Use color-coded severity badges
     - High: Red
     - Moderate: Orange
     - Low: Yellow
   - **Suggestion:** Display prominently with proper formatting
   - Add disclaimer about AI-generated content

5. **History:**
   - Show search/filter by medicine name
   - Display date/time of request
   - Allow viewing full details
   - Implement pagination

6. **Error Handling:**
   - Handle 429 (rate limit) gracefully
   - Show retry countdown
   - Handle 500 errors with user-friendly message
   - Validate input before submission

7. **Caching Indicator:**
   - Show "Cached Response" badge if `cached: true`
   - Display response time
   - Explain caching to users

8. **Autocomplete:**
   - Consider implementing medicine name autocomplete
   - Use previous searches for suggestions
   - Common medicine database for suggestions

9. **Disclaimer:**
   - Always display medical disclaimer
   - Make it prominent and clear
   - Include "Consult a healthcare professional" message
   - Add terms of use link

10. **Accessibility:**
    - Use semantic HTML for warnings (alerts)
    - Provide screen reader support
    - Ensure color contrast for severity indicators
    - Keyboard navigation support

### Example Usage Flow
```javascript
// 1. Check rate limit before showing form
// 2. User fills medicine name and patient info
// 3. Submit request
// 4. Show loading state
// 5. Display results with alternatives and warnings
// 6. Save to history automatically
// 7. Allow user to view history
```

### Security Considerations
1. Never expose GROQ API key to frontend
2. Validate all inputs on both client and server
3. Sanitize medicine names to prevent injection
4. Rate limit to prevent abuse
5. Log all requests for audit trail
6. Monitor for unusual patterns
