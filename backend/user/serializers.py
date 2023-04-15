# serializers.py
from rest_framework import serializers
from user.models import User,Story,Location,Comment #, Date, SpecificDate, Decade, Season
from rest_framework.fields import CharField
from rest_framework.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType



class UserRegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password','password_again')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):


        if validated_data["password"] != validated_data["password_again"]:
            print("caner")
            raise serializers.ValidationError("Passwords do no match!")
            
        user_data = self.Meta.model(**validated_data)

        

        #user_data.set_password(password)
        user_data.save()
        return user_data


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "biography",
            "followers"
        ]
        read_only_fields = ("id",)

class UserFollowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class UserLoginSerializer(serializers.ModelSerializer):
    #token = CharField(allow_blank=True, read_only=True)
    username = CharField(write_only=True, required=True)
    user = UsersSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "password",
            "user",
        ]
        extra_kwargs = {"password": {"write_only": True, "required": False}}


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'latitude', 'longitude']

class StorySerializer(serializers.ModelSerializer):
    location_ids = LocationSerializer(many=True)

    class Meta:
        model = Story
        fields = ['id', 'author', 'title', 'content', 'story_tags', 'location_ids', 'date_type', 'season_name', 'year', 'date','creation_date']

    def validate(self, attrs):
        date_type = attrs.get('date_type')
        season_name = attrs.get('season_name')
        year = attrs.get('year')
        date = attrs.get('date')

        if date_type == Story.SEASON and (year is not None or date is not None):
            raise serializers.ValidationError("Only 'season_name' field should be set when 'date_type' is 'season'.")
        elif date_type == Story.DECADE and (season_name is not None or date is not None):
            raise serializers.ValidationError("Only 'year' field should be set when 'date_type' is 'decade'.")
        elif date_type == Story.NORMAL_DATE and (season_name is not None or year is not None):
            raise serializers.ValidationError("Only 'date' field should be set when 'date_type' is 'normal_date'.")

        return attrs

    def create(self, validated_data, **kwargs):
        location_data = validated_data.pop('location_ids')
        locations = [Location.objects.create(**location) for location in location_data]

        story = Story.objects.create(**validated_data)
        story.location_ids.set(locations)
        
        return story

class CommentSerializer(serializers.ModelSerializer):


    class Meta:
        model = Comment
        fields = ['id', 'comment_author', 'story', 'text', 'date']
        #read_only_fields = ['id', 'comment_author', 'story', 'date']