from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.validators import RegexValidator
import re
from .models import File

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'full_name', 'password', 'password2']

    def validate_username(self, value):
        if not re.match(r'^[A-Za-z][A-Za-z0-9]{3,19}$', value):
            raise serializers.ValidationError(
                'Логин должен начинаться с буквы, содержать только латиницу и цифры, длина 4-20 символов'
            )
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email уже используется')
        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError('Пароль должен быть не менее 6 символов')
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError('Пароль должен содержать хотя бы одну заглавную букву')
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError('Пароль должен содержать хотя бы одну цифру')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError('Пароль должен содержать хотя бы один специальный символ')
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Пароли не совпадают'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'is_admin', 'storage_path']


class FileSerializer(serializers.ModelSerializer):
    size_display = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    share_url = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'original_name', 'size', 'size_display', 'comment',
                  'upload_date', 'last_download_date', 'mime_type', 'file_url', 'share_url']
        read_only_fields = ['upload_date', 'last_download_date', 'unique_name', 'share_link']

    def get_size_display(self, obj):
        return obj.get_file_size_display()

    def get_file_url(self, obj):
        return f"/api/files/download/{obj.id}/"

    def get_share_url(self, obj):
        if obj.share_link:
            return f"/api/share/{obj.share_link}/"
        return None