# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser,Group,Permission

class User(AbstractUser):
    email = models.EmailField(verbose_name="e-mail", max_length = 100, unique = True)
    username = models.CharField(max_length=30, unique=True)
    creation_date = models.DateTimeField(auto_now_add=True)
    password_again = models.CharField(max_length=128, verbose_name='password_again',null=True)
    #is_admin = models.BooleanField(default=False)
    #is_active = models.BooleanField(default=True)
    #is_expert = models.BooleanField(default=False)
    #profile_image = models.CharField(max_length=9000000, null=True, blank=True)


    #USERNAME_FIELD = "email"
    #REQUIRED_FIELDS = [] 
