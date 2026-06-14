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
    storage_limit_display = serializers.SerializerMethodField()
    storage_used_display = serializers.SerializerMethodField()
    storage_percent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'is_admin', 'storage_path',
                  'storage_limit', 'storage_used', 'storage_limit_display',
                  'storage_used_display', 'storage_percent']

    def get_storage_limit_display(self, obj):
        return self.format_bytes(obj.storage_limit)

    def get_storage_used_display(self, obj):
        return self.format_bytes(obj.storage_used)

    def get_storage_percent(self, obj):
        if obj.storage_limit == 0:
            return 0
        return round((obj.storage_used / obj.storage_limit) * 100, 2)

    def format_bytes(self, bytes_val):
        if bytes_val == 0:
            return '0 Bytes'
        k = 1024
        sizes = ['Bytes', 'KB', 'MB', 'GB']
        i = 0
        while bytes_val >= k and i < len(sizes) - 1:
            bytes_val /= k
            i += 1
        return f"{bytes_val:.2f} {sizes[i]}"


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
        """Форматирование размера файла"""
        size = obj.size
        if size == 0:
            return '0 Bytes'
        k = 1024
        sizes = ['Bytes', 'KB', 'MB', 'GB']
        i = 0
        while size >= k and i < len(sizes) - 1:
            size /= k
            i += 1
        return f"{size:.2f} {sizes[i]}"

    def get_file_url(self, obj):
        return f"/api/files/{obj.id}/download/"

    def get_share_url(self, obj):
        if obj.share_link:
            return f"/api/share/{obj.share_link}/"
        return None