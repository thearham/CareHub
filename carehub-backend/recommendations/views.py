"""
Views for recommendations app.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.core.cache import cache
from drf_spectacular.utils import extend_schema
import logging

from .models import MedicineRecommendation
from .serializers import (
    MedicineRecommendationRequestSerializer,
    MedicineRecommendationSerializer,
    MedicineRecommendationResponseSerializer,
    ClearCacheResponseSerializer,
    RecommendationStatsSerializer
)
from .service import get_medicine_recommendations

logger = logging.getLogger(__name__)


@method_decorator(ratelimit(key='user', rate='10/h', method='POST'), name='dispatch')
class MedicineRecommendationView(APIView):
    """
    Get medicine recommendations using GROQ LLM.
    POST /api/recommendations/
    
    Rate limited: 10 requests per hour per user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        request=MedicineRecommendationRequestSerializer,
        responses={200: MedicineRecommendationResponseSerializer}
    )
    def post(self, request):
        serializer = MedicineRecommendationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        medicine_name = serializer.validated_data['medicine_name']
        patient_info = serializer.validated_data.get('patient_info', {})
        
        try:
            # Get recommendations from service
            recommendation_data = get_medicine_recommendations(medicine_name, patient_info)
            
            # Check if response was cached
            import json
            cache_key = f"med_rec_{medicine_name}_{json.dumps(patient_info, sort_keys=True)}"
            was_cached = cache.get(cache_key) is not None
            
            # Save to database for history
            recommendation = MedicineRecommendation.objects.create(
                requested_by=request.user,
                medicine_name=medicine_name,
                patient_info=patient_info,
                alternatives=recommendation_data.get('alternatives', []),
                warnings=recommendation_data.get('warnings', []),
                suggestion=recommendation_data.get('suggestion', ''),
                response_time_ms=recommendation_data.get('response_time_ms')
            )
            
            # Prepare response
            response_data = {
                'id': recommendation.id,
                'medicine_name': medicine_name,
                'alternatives': recommendation_data.get('alternatives', []),
                'warnings': recommendation_data.get('warnings', []),
                'suggestion': recommendation_data.get('suggestion', ''),
                'response_time_ms': recommendation_data.get('response_time_ms'),
                'cached': was_cached,
                'note': recommendation_data.get('note', '')
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating medicine recommendation: {str(e)}")
            return Response(
                {
                    'error': 'Failed to generate medicine recommendation',
                    'detail': str(e) if request.user.user_type == 'ADMIN' else 'Internal server error'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MedicineRecommendationHistoryView(generics.ListAPIView):
    """
    Get medicine recommendation history for current user.
    GET /api/recommendations/history/
    """
    serializer_class = MedicineRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MedicineRecommendation.objects.filter(
            requested_by=self.request.user
        ).order_by('-created_at')


class MedicineRecommendationDetailView(generics.RetrieveAPIView):
    """
    Get specific medicine recommendation.
    GET /api/recommendations/{id}/
    """
    serializer_class = MedicineRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'ADMIN':
            return MedicineRecommendation.objects.all()
        
        return MedicineRecommendation.objects.filter(requested_by=user)


@extend_schema(
    request=None,
    responses={200: ClearCacheResponseSerializer}
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def clear_cache(request):
    """
    Clear medicine recommendation cache (Admin only).
    POST /api/recommendations/clear-cache/
    """
    if request.user.user_type != 'ADMIN':
        return Response(
            {'error': 'Only admins can clear the cache'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from .service import clear_recommendation_cache
    clear_recommendation_cache()
    
    return Response({'message': 'Cache cleared successfully'})


@extend_schema(
    responses={200: RecommendationStatsSerializer}
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recommendation_stats(request):
    """
    Get recommendation statistics (Admin only).
    GET /api/recommendations/stats/
    """
    if request.user.user_type != 'ADMIN':
        return Response(
            {'error': 'Only admins can view statistics'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from django.db.models import Count, Avg
    
    stats = {
        'total_recommendations': MedicineRecommendation.objects.count(),
        'unique_medicines': MedicineRecommendation.objects.values('medicine_name').distinct().count(),
        'unique_users': MedicineRecommendation.objects.values('requested_by').distinct().count(),
        'avg_response_time_ms': MedicineRecommendation.objects.aggregate(
            Avg('response_time_ms')
        )['response_time_ms__avg'],
        'top_medicines': list(
            MedicineRecommendation.objects.values('medicine_name')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
    }
    
    return Response(stats)
