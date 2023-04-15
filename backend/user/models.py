# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser,Group,Permission
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class User(AbstractUser):
    email = models.EmailField(verbose_name="e-mail", max_length = 100, unique = True)
    username = models.CharField(max_length=30, unique=True)
    creation_date = models.DateTimeField(auto_now_add=True)
    password_again = models.CharField(max_length=128, verbose_name='password_again',null=True)
    biography = models.TextField(blank=True)
    #profile_photo = models.ImageField(upload_to='profile_photos/', blank=True)
    followers = models.ManyToManyField('self', related_name='following', symmetrical=False, blank=True)
    #is_admin = models.BooleanField(default=False)
    #is_active = models.BooleanField(default=True)
    #is_expert = models.BooleanField(default=False)
    #profile_image = models.CharField(max_length=9000000, null=True, blank=True)


    #USERNAME_FIELD = "email"
    #REQUIRED_FIELDS = [] 
class Location(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    def __str__(self):
        return self.name    
"""
class Date(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class SpecificDate(Date):
    date_name = models.CharField(max_length=255, null=True)
    date = models.DateField(null=True)

    def __str__(self):
        return f"{self.date} ({self.name})"


class Decade(Date):
    date_name = models.CharField(max_length=255, null=True)
    start_year = models.IntegerField(null=True)

    def __str__(self):
        return f"{self.date} ({self.date})"


class Season(Date):
    date_name = models.CharField(max_length=255, null=True)
    year = models.IntegerField(null=True)
    season_name = models.CharField(max_length=255, null=True)

    def __str__(self):
        return f"{self.date}s ({self.date})"
"""
class Story(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, null=True)
    content = models.TextField(null=True)
    creation_date = models.DateTimeField(null=True,auto_now_add=True)
    story_tags = models.CharField(max_length=255, null=True)
    location_id = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)
    date = models.DateField(null=True)
    likes = models.ManyToManyField(User, related_name='liked_stories', blank=True)
    
    
    #date_id = models.ForeignKey(Date, on_delete=models.SET_NULL, null=True)
    #date_content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True)
    #date_object_id = models.PositiveIntegerField(null=True)
    #date_object = GenericForeignKey('date_content_type', 'date_object_id')

    def __str__(self):
        return self.title
    
class Comment(models.Model):
    comment_author = models.ForeignKey(User, on_delete=models.CASCADE)
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Comment by {self.comment_author} on {self.story.title}'