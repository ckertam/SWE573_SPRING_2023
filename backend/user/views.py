# views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import authenticate,login,logout
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserRegisterSerializer,UserLoginSerializer
import rest_framework.exceptions
from django.http import HttpResponse
from .models import User,CustomToken
import json
import jwt

class UserRegistrationView(generics.CreateAPIView):
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
        

class UserLoginView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserLoginSerializer

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

        #token = Token.objects.create(user=user)
        payload = {'user_id': user.id}
        token_string = jwt.encode(payload, 'abcabc', algorithm='HS256')

        # Create Token object
        try:
            token = Token.objects.get(user=user)
            print(token)
            response = HttpResponse()
            response.set_cookie(key="jwt", value=token, httponly=True)

            #return response
            return Response(data = {'message':'Already logged in!', 'username':user.username}, status=status.HTTP_200_OK)
        
        except:
            token = Token.objects.create(user=user,key=token_string)


            print("caner")
            user_filtered = User.objects.filter(username=request.data.get("username")).first()
            #user_filtered = authenticate(username=username, password=password)
            #print(user_filtered)
            login(request,user_filtered)
            print("caner3") 
            response = HttpResponse()
            response.set_cookie(key="jwt", value=token, httponly=True)
            
            #return response
            
            return  Response( {'message':'Login succesful!', 'username':username}, status=status.HTTP_200_OK)
        
        
    
        #return Response({'message':'Successfully loged in with!', 'username':username}, status=status.HTTP_201_CREATED)