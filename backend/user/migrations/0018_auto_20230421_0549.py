# Generated by Django 4.1.7 on 2023-04-21 02:49
from django.db import models
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0017_story_end_date_story_start_date_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='profile_photo',
            field=models.ImageField(blank=True, null=True, upload_to='profile_photos/'),
        ),
    ]