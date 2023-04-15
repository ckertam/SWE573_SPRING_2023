# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser,Group,Permission
from django.core.exceptions import ValidationError

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

class Story(models.Model):
    SEASON = 'season'
    DECADE = 'decade'
    NORMAL_DATE = 'normal_date'
    
    DATE_TYPES = [
        (SEASON, 'Season'),
        (DECADE, 'Decade'),
        (NORMAL_DATE, 'Normal Date'),
    ]


    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, null=True)
    content = models.TextField(null=True)
    creation_date = models.DateTimeField(null=True,auto_now_add=True)
    story_tags = models.CharField(max_length=255, null=True)
    location_ids = models.ManyToManyField(Location, blank=True)
    date_type = models.CharField(max_length=20, choices=DATE_TYPES, default=NORMAL_DATE)
    season_name = models.CharField(max_length=255, null=True, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    likes = models.ManyToManyField(User, related_name='liked_stories', blank=True)
    
    def clean(self):
        # Custom validation to ensure only one date field is set
        date_fields = [self.season_name, self.year, self.date]
        if date_fields.count(None) != 2:
            raise ValidationError("Only one type of date field should be set.")

    def save(self, *args, **kwargs):
        self.clean()
        super(Story, self).save(*args, **kwargs)


    def __str__(self):
        return self.title
    
class Comment(models.Model):
    comment_author = models.ForeignKey(User, on_delete=models.CASCADE)
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Comment by {self.comment_author} on {self.story.title}'