from django.urls import path
from .views import *

urlpatterns = [
    path('register', UserRegistrationView.as_view()),
    path('login', UserLoginView.as_view()),
    path('user', AuthUserAPIView.as_view()),
    path('refresh', RefreshUserAuthAPIView.as_view()),
    path('logout', LogutAPIView.as_view()),
]