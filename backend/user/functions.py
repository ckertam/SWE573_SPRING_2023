# views.py
from rest_framework.response import Response
from rest_framework.authentication import get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from .models import User,Story
from .authentication import *
import json

def auth_check(request):
    auth = get_authorization_header(request).split()

    if auth and len(auth) == 2:
        token = auth[1].decode('utf-8')
        id = decode_refresh_token(token)

        user = User.objects.filter(pk=id).first()

        #deneme = User.objects.filter(user=user).first()
        return user.id
            
    return 'unauth'