# serializers.py
from rest_framework import serializers
from user.models import User


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password','password_again')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        email = validated_data.get("email")
        username = validated_data.get("username")
        password = validated_data.get("password")

        if validated_data["password"] != validated_data["password_again"]:
            print("caner")
            raise serializers.ValidationError("Passwords do no match!")
            return
        user_data = self.Meta.model(**validated_data)

        

        #user_data.set_password(password)
        user_data.save()
        return user_data
