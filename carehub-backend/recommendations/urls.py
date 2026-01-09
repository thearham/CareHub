"""
URL configuration for recommendations app.
"""
from django.urls import path
from .views import (
    MedicineRecommendationView,
    MedicineRecommendationHistoryView,
    MedicineRecommendationDetailView,
    clear_cache,
    recommendation_stats,
)

app_name = 'recommendations'

urlpatterns = [
    path('', MedicineRecommendationView.as_view(), name='get-recommendation'),
    path('history/', MedicineRecommendationHistoryView.as_view(), name='recommendation-history'),
    path('<int:pk>/', MedicineRecommendationDetailView.as_view(), name='recommendation-detail'),
    path('clear-cache/', clear_cache, name='clear-cache'),
    path('stats/', recommendation_stats, name='recommendation-stats'),
]
