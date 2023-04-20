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
    path('comment/<int:id>',CreateCommentView.as_view()),
    path('commentsByStory/<int:id>',StoryCommentsView.as_view()),
    path('followByUser/<int:id>',FollowUserView.as_view()),
    path('userFollowers',UserFollowersView.as_view()),
    path('userFollowers/<int:user_id>',UserFollowersView.as_view()),
    path('userStories',StoryAuthorView.as_view()),
    path('userStories/<int:user_id>',StoryAuthorView.as_view()),
    path('usernamesbyId',UsernamesByIDsView.as_view()),
    path('biography',UserBiographyView.as_view()),
    path('userDetails',UserDetailsView.as_view()),
    path('userDetails/<int:user_id>',UserDetailsView.as_view()),
    path('profilePhoto',UserPhotoView.as_view()),
    path('profilePhoto/<int:user_id>',UserPhotoView.as_view()),
]