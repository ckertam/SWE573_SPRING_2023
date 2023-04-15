# views.py
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authentication import get_authorization_header
from .serializers import UserRegisterSerializer
from rest_framework.exceptions import AuthenticationFailed
from .models import User
from .authentication import *
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
        auth = get_authorization_header(request).split()
        print(auth)

        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            id = decode_refresh_token(token)

            user = User.objects.filter(pk=id).first()

            #deneme = User.objects.filter(user=user).first()
            return Response(user.id)
        
        raise AuthenticationFailed('unauth')

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