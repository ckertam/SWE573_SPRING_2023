# views.py
from rest_framework import status, views
from rest_framework.response import Response
from .serializers import UserRegisterSerializer,StorySerializer,CommentSerializer,UsersSerializer,UserFollowerSerializer
from rest_framework.exceptions import AuthenticationFailed
from .models import User,Story,Comment
from .authentication import *
from .functions import auth_check
import json

class UserRegistrationView(views.APIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            #token = Token.objects.create(user=user)
            user.save()
            return Response({'message':'Successfully registered!', 'email':user.email,
                                    'username':user.username}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class UserLoginView(views.APIView):
    queryset = User.objects.all()

    def post(self, request, *args, **kwargs):
        body = json.loads(request.body)

        # Get the username and password from the JSON data
        username = body.get('username')
        password = body.get('password')

        # Use the username and password to authenticate the user
        user = User.objects.filter(username=username).first()

        
        if user is None :
            return Response({'error': 'Invalid username'}, status=400)
        if user.check_password(password):
            return Response({'error': 'Wrong password'}, status=400)
        

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        print(access_token)
        print(refresh_token)
        response = Response()

        response.set_cookie(key='refreshToken', value = refresh_token, httponly= True)
        response.data = {
            'access': access_token,
            'refresh' : refresh_token
        }

        return response

class AuthUserAPIView(views.APIView):
    def get(self,request):

        user_id = auth_check(request)

        return Response(user_id)

class RefreshUserAuthAPIView(views.APIView):
    def post(self,request):
        refresh_token = request.COOKIES.get('refreshToken')

        id = decode_refresh_token(refresh_token)
        print(id)
        access_token = create_access_token(id)
        return Response({
            'token': access_token
        })

class LogutAPIView(views.APIView):
    def post(self, _):
        response = Response()
        response.delete_cookie(key="refreshToken")
        response.data = {
            'message': 'success'
        }
        return response
    

class CreateStoryView(views.APIView):
    def post(self, request):

        user_id = auth_check(request)
        
        request_data = json.loads(request.body)
        request_data['author'] = user_id
        serializer = StorySerializer(data=request_data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LikeStoryView(views.APIView):
    def post(self, request, pk):
        user_id = auth_check(request)
        
        story = Story.objects.get(pk=pk)
        # Check if the user has already liked the story
        if user_id in story.likes.all().values_list('id', flat=True):
            # If the user has already liked the story, remove the like
            story.likes.remove(user_id)
            story.save()
            return Response({'message': 'Like removed successfully.'}, status=status.HTTP_200_OK)
        else:
            # If the user has not liked the story, add a new like
            story.likes.add(user_id)
            story.save()
            return Response({'message': 'Like added successfully.'}, status=status.HTTP_200_OK)
            
class StoryDetailView(views.APIView):
    def get(self, request, pk):
        try:
            story = Story.objects.get(pk=pk)
        except Story.DoesNotExist:
            return Response({'message': 'Story not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = StorySerializer(story)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class CreateCommentView(views.APIView):
    def post(self, request, pk):
        user_id = auth_check(request)

        try:
            story = Story.objects.get(pk=pk)
        except Story.DoesNotExist:
            return Response({'error': 'Story does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        data = {
            'comment_author': user_id,
            'story': pk,
            'text': request.data.get('text')
        }
        print(data)
        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class StoryCommentsView(views.APIView):
    def get(self, request, pk):
        try:
            story = Story.objects.get(pk=pk)
        except Story.DoesNotExist:
            return Response({'error': 'Story does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        comments = Comment.objects.filter(story=story).order_by('-date')
        serializer = CommentSerializer(comments, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

class FollowUserView(views.APIView):
    def post(self, request, pk):
        user = auth_check(request)
        print(user)

        try:
            user_to_follow = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        if user == user_to_follow.id:
            return Response({'error': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        if user_to_follow.followers.filter(pk=user).exists():
            user_to_follow.followers.remove(user)
            #serializer = UsersSerializer(user_to_follow)
            return Response("unfollowed", status=status.HTTP_200_OK)
        else:
            user_to_follow.followers.add(user)
            #serializer = UsersSerializer(user_to_follow)

            return Response("followed", status=status.HTTP_200_OK)
        
class UserFollowersView(views.APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        followers = user.followers.all()
        serializer = UserFollowerSerializer(followers, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK) 


class StoryAuthorView(views.APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        stories = Story.objects.filter(author=user).order_by('-creation_date')
        serializer = StorySerializer(stories, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)