"""
Models for recommendations app.
"""
from django.db import models
from accounts.models import User


class MedicineRecommendation(models.Model):
    """
    Store medicine recommendation requests and responses for caching.
    """
    
    requested_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='medicine_recommendations'
    )
    
    medicine_name = models.CharField(max_length=255)
    patient_info = models.JSONField(
        default=dict,
        blank=True,
        help_text='Patient age, allergies, comorbidities, etc.'
    )
    
    # Response from LLM
    alternatives = models.JSONField(default=list, help_text='List of alternative medicines')
    warnings = models.JSONField(default=list, help_text='List of warnings and contraindications')
    suggestion = models.TextField(blank=True, help_text='General suggestion')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    response_time_ms = models.IntegerField(null=True, blank=True, help_text='LLM response time in milliseconds')
    
    class Meta:
        db_table = 'medicine_recommendations'
        verbose_name = 'Medicine Recommendation'
        verbose_name_plural = 'Medicine Recommendations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['medicine_name', 'created_at']),
            models.Index(fields=['requested_by', 'created_at']),
        ]
    
    def __str__(self):
        return f"Recommendation for {self.medicine_name} by {self.requested_by.username}"
