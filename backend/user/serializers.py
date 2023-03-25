# serializers.py
from rest_framework import serializers
from user.models import User
from rest_framework.fields import CharField
from rest_framework.exceptions import ValidationError


class UserRegisterSerializer(serializers.ModelSerializer):

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


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
        ]
        read_only_fields = ("id",)

class UserLoginSerializer(serializers.ModelSerializer):
    #token = CharField(allow_blank=True, read_only=True)
    username = CharField(write_only=True, required=True)
    user = UsersSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "password",
            #"token",
            "user",
        ]
        extra_kwargs = {"password": {"write_only": True, "required": False}}

    def validate(self, data):
        password = data.get("password")
        username = data.get("username")
        user = User.objects.filter(username=username).distinct()
        if user.exists():
            user_data = user.first()
        else:
            raise ValidationError("Incorrect credential")
        if user_data:
            if not user_data.check_password(password):
                raise ValidationError({"detail": "Incorrect credential"})
        #payload = JWT_PAYLOAD_HANDLER(user_obj)
        #token = JWT_ENCODE_HANDLER(payload)
        #data["token"] = token
        data["user"] = UsersSerializer(user_data).data
        return data