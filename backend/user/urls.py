from django.urls import path
from .views import *

urlpatterns = [
    path('register', UserRegistrationView.as_view()),
    path('login', UserLoginView.as_view()),
    path('user', AuthUserAPIView.as_view()),
    path('refresh', RefreshUserAuthAPIView.as_view()),
    path('logout', LogutAPIView.as_view()),
    path('story',CreateStoryView.as_view()),
    path('like/<int:pk>',LikeStoryView.as_view()),
    path('story/<int:pk>/', StoryDetailView.as_view()),
]