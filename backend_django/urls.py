"""
URL Configuration for Farm Produce Market Django Backend
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterAPIView, LoginAPIView, ProduceViewSet,
    NegotiationViewSet, OrderViewSet, MarketPriceViewSet
)

router = DefaultRouter()
router.register(r'produce', ProduceViewSet, basename='produce')
router.register(r'negotiations', NegotiationViewSet, basename='negotiation')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'market-prices', MarketPriceViewSet, basename='market-price')

urlpatterns = [
    path('auth/register/', RegisterAPIView.as_view(), name='register'),
    path('auth/login/', LoginAPIView.as_view(), name='login'),
    path('', include(router.urls)),
]
