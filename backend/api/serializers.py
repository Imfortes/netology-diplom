from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.validators import RegexValidator
import re

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'full_name', 'password', 'password2']

    def validate_username(self, value):
        """Только латиница и цифры, первый символ буква, длина 4-20"""
        if not re.match(r'^[A-Za-z][A-Za-z0-9]{3,19}$', value):
            raise serializers.ValidationError(
                'Логин должен начинаться с буквы, содержать только латиницу и цифры, длина 4-20 символов'
            )
        return value

    def validate_email(self, value):
        """Проверка email формата (Django сделает базовую проверку)"""
        # Django сам проверит формат, можем добавить дополнительные проверки
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email уже используется')
        return value

    def validate_password(self, value):
        """Пароль: минимум 6 символов, заглавная буква, цифра, спецсимвол"""
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
        """Проверка совпадения паролей"""
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Пароли не совпадают'})
        return data

    def create(self, validated_data):
        """Создание пользователя"""
        validated_data.pop('password2')  # Убираем подтверждение пароля
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Для отображения информации о пользователе (без пароля)"""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'is_admin']