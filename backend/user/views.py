# views.py
from rest_framework import status, views, generics
from rest_framework.response import Response
from .serializers import *
from .models import User,Story,Comment
from .authentication import *
from .functions import auth_check
from django.shortcuts import get_object_or_404
import json
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
import os
from django.core.paginator import Paginator
from math import ceil


#@csrf_exempt
class UserRegistrationView(views.APIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

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

        #user_id = auth_check(request) #when using postman
        print(request.COOKIES)
        cookie_value = request.COOKIES['refreshToken']
        user_id = decode_refresh_token(cookie_value)

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

class LogoutAPIView(views.APIView):
    def post(self, request):

        response = Response()
        response.delete_cookie('refreshToken')
        response.data = {
            'message': 'success'
        }
        return response

class CreateStoryView(views.APIView):
    def post(self, request):

        #user_id = auth_check(request) #when using postman
        print(request.COOKIES)
        cookie_value = request.COOKIES['refreshToken']
        user_id = decode_refresh_token(cookie_value)
        
        print(request.body)
        request_data = json.loads(request.body)
        print(request_data)
        
        request_data['author'] = user_id 
        serializer = StorySerializer(data=request_data)
        #print(serializer.data)
        #print(request_data)
        #print(request.body)
        
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

        print(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class CreateCommentView(views.APIView):
    def post(self, request, id):
        
        cookie_value = request.COOKIES['refreshToken']
        user_id = decode_refresh_token(cookie_value)
        #user_id = auth_check(request)

        try:
            story = Story.objects.get(pk=id)
        except Story.DoesNotExist:
            return Response({'error': 'Story does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        data = {
            'comment_author': user_id,
            'story': id,
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
    def get(self, request, id):
        try:
            story = Story.objects.get(pk=id)
        except Story.DoesNotExist:
            return Response({'error': 'Story does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        # Get the page number and size
        page_number = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('size', 3))

        # Paginate the comments
        comments = Comment.objects.filter(story=story).order_by('date')
        paginator = Paginator(comments, page_size)
        total_pages = ceil(paginator.count / page_size)
        page = paginator.get_page(page_number)

        serializer = CommentGetSerializer(page, many=True)

        
        return Response({
            'comments': serializer.data,
            'has_next': page.has_next(),
            'has_prev': page.has_previous(),
            'next_page': page.next_page_number() if page.has_next() else None,
            'prev_page': page.previous_page_number() if page.has_previous() else None,
            'total_pages': total_pages,
        }, status=status.HTTP_200_OK)

class FollowUserView(views.APIView):
    def post(self, request, id):
        #user = auth_check(request)

        cookie_value = request.COOKIES['refreshToken']
        user_id = decode_refresh_token(cookie_value)
        print(user_id)
        try:
            user_to_follow = User.objects.get(pk=id)
        except User.DoesNotExist:
            return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        if user_id == user_to_follow.id:
            return Response({'error': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        if user_to_follow.followers.filter(pk=user_id).exists():
            user_to_follow.followers.remove(user_id)
            #serializer = UsersSerializer(user_to_follow)
            return Response("unfollowed", status=status.HTTP_200_OK)
        else:
            user_to_follow.followers.add(user_id)
            #serializer = UsersSerializer(user_to_follow)

            return Response("followed", status=status.HTTP_200_OK)
        
class UserFollowersView(views.APIView):
    def get(self, request,user_id=None):
        

        if user_id:
            user = get_object_or_404(User, pk=user_id)
        else:
            cookie_value = request.COOKIES['refreshToken']
            user_id = decode_refresh_token(cookie_value)
            user = get_object_or_404(User, pk=user_id)

        followers = user.followers.all()
        serializer = UserFollowerSerializer(followers, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK) 


class StoryAuthorView(views.APIView):
    def get(self, request, user_id=None):

        print(request.COOKIES)

        if user_id:
            user = get_object_or_404(User, pk=user_id)
        else:
            cookie_value = request.COOKIES['refreshToken']
            user_id = decode_refresh_token(cookie_value)
            user = get_object_or_404(User, pk=user_id)

        followed_users_ids = user.following.values_list('id', flat=True)
        #print(followed_users)
        #followed_users_ids = followed_users.values_list('id', flat=True)

        # Get the page number and size
        page_number = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('size', 3))

        # Paginate the stories
        stories = Story.objects.filter(author__in=followed_users_ids).order_by('-creation_date')
        paginator = Paginator(stories, page_size)
        total_pages = ceil(paginator.count / page_size)
        page = paginator.get_page(page_number)

        serializer = StorySerializer(page, many=True)

        
        return Response({
            'stories': serializer.data,
            'has_next': page.has_next(),
            'has_prev': page.has_previous(),
            'next_page': page.next_page_number() if page.has_next() else None,
            'prev_page': page.previous_page_number() if page.has_previous() else None,
            'total_pages': total_pages,
        }, status=status.HTTP_200_OK)
    

class UsernamesByIDsView(views.APIView):
    def get(self, request):

        user_ids = request.GET.getlist('user_ids[]')
        usernames = User.objects.filter(id__in=user_ids).values_list('username', flat=True)
        return Response(list(usernames))

class UserDetailsView(views.APIView):
        
    def get(self, request, user_id=None):

        #user_id = auth_check(request)
        if user_id:
            user = get_object_or_404(User, pk=user_id)
        else:
            cookie_value = request.COOKIES['refreshToken']
            user_id = decode_refresh_token(cookie_value)
            user = get_object_or_404(User, pk=user_id)

        serializer = UsersSerializer(user)
        return Response(serializer.data)

class UserBiographyView(views.APIView):

    def get(self, request):
        user_id = auth_check(request)

        user = get_object_or_404(User, pk=user_id)

        serializer = UserBiographySerializer(user)
        return Response(serializer.data)

    def put(self, request):
        
        user_id = auth_check(request)

        user = get_object_or_404(User, pk=user_id)

        serializer = UserBiographySerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPhotoView(views.APIView):

    def get(self, request, user_id=None):
        
        #user_id = auth_check(request)
        if user_id:
            user = get_object_or_404(User, pk=user_id)
        else:
            cookie_value = request.COOKIES['refreshToken']
            user_id = decode_refresh_token(cookie_value)
            user = get_object_or_404(User, pk=user_id)

        serializer = UserPhotoSerializer(user)

        file_ext = os.path.splitext(user.profile_photo.name)[-1].lower()
        content_type = 'image/jpeg' if file_ext == '.jpg' or file_ext == '.jpeg' else 'image/png'

        # Serve the image file with the proper content type and inline attachment
        response = HttpResponse(user.profile_photo, content_type=content_type)
        response['Content-Disposition'] = f'inline; filename="{user.profile_photo.name}"'

        return response

    def put(self, request):
        
        user_id = auth_check(request)

        user = get_object_or_404(User, pk=user_id)

        serializer = UserPhotoSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
