# tests.py
from django.core.exceptions import ValidationError
from datetime import datetime
from .models import User, Location, Story, Comment
from django.test import TestCase, RequestFactory
from django.urls import reverse
from rest_framework.test import APIClient,APITestCase
from django.shortcuts import get_object_or_404
from rest_framework import status
from .authentication import *
from .views import *
import json


def get_jwt_for_user(user):
    token = create_refresh_token(user.pk)
    return token

def get_user_id_from_token(token):
    user_id = decode_refresh_token(token)
    return user_id
class UserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword"
        )

    def test_user_creation(self):
        self.assertEqual(self.user.username, "testuser")
        self.assertEqual(self.user.email, "testuser@example.com")

    def test_user_following(self):
        user2 = User.objects.create_user(
            username="testuser2",
            email="testuser2@example.com",
            password="testpassword2"
        )
        self.user.following.add(user2)
        self.assertTrue(user2 in self.user.following.all())

class LocationModelTest(TestCase):
    def setUp(self):
        self.location = Location.objects.create(
            name="Test Location",
            latitude=12.3456789,
            longitude=98.7654321
        )

    def test_location_creation(self):
        self.assertEqual(self.location.name, "Test Location")
        self.assertEqual(self.location.latitude, 12.3456789)
        self.assertEqual(self.location.longitude, 98.7654321)

class StoryModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword"
        )
        self.story = Story.objects.create(
            author=self.user,
            title="Test Story",
            content="<p>This is a test story.</p>",
            story_tags="test, story",
            date=datetime(2023, 5, 15)
        )

    def test_story_creation(self):
        self.assertEqual(self.story.author, self.user)
        self.assertEqual(self.story.title, "Test Story")
        self.assertEqual(self.story.content, "<p>This is a test story.</p>")
        self.assertEqual(self.story.story_tags, "test, story")

    def test_invalid_date_fields(self):
        with self.assertRaises(ValidationError):
            story = Story(
                author=self.user,
                title="Invalid Date Test",
                content="<p>Invalid date test story.</p>",
                story_tags="test, invalid",
                date=datetime(2023, 5, 15)
            )
            story.save()

class CommentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword"
        )
        self.story = Story.objects.create(
            author=self.user,
            title="Test Story",
            content="<p>This is a test story.</p>",
            story_tags="test, story",
            year=1996
        )
        self.comment = Comment.objects.create(
            comment_author=self.user,
            story=self.story,
            text="This is a test comment."
        )

    def test_comment_creation(self):
        self.assertEqual(self.comment.comment_author, self.user)
        self.assertEqual(self.comment.story, self.story)
        self.assertEqual(self.comment.text, "This is a test comment.")

