from django.urls import path
from .views import *

urlpatterns = [
    path('register', UserRegistrationView.as_view()),
    path('login', UserLoginView.as_view()),
    path('user', AuthUserAPIView.as_view()),
    path('refresh', RefreshUserAuthAPIView.as_view()),
    path('logout', LogoutAPIView.as_view()),
    path('storyCreate',CreateStoryView.as_view()),
    path('like/<int:pk>',LikeStoryView.as_view()),
    path('storyGet/<int:pk>', StoryDetailView.as_view()),
    path('storyGetbyAuthor/<int:user_id>', StoryAuthorView.as_view()),
    path('comment/<int:pk>',CreateCommentView.as_view()),
    path('commentsByStory/<int:pk>',StoryCommentsView.as_view()),
    path('followByUser/<int:pk>',FollowUserView.as_view()),
    path('userFollowers',UserFollowersView.as_view()),
    path('userStories',StoryAuthorView.as_view()),
    path('usernamesbyId',UsernamesByIDsView.as_view()),
    
]