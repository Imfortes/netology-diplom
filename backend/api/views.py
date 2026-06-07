from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from django.contrib.auth import authenticate, login, logout
from .serializers import RegisterSerializer, UserSerializer
from .models import User

@api_view(['GET'])
def hello(request):
    return Response({'hello': 'world in 2026'})

@api_view(['POST'])
def register(request):
    """Регистрация нового пользователя"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Регистрация успешна',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_view(request):
    """Вход в систему"""
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        return Response({
            'message': 'Вход выполнен',
            'user': UserSerializer(user).data
        })
    return Response(
        {'error': 'Неверный логин или пароль'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
def logout_view(request):
    """Выход из системы"""
    logout(request)
    return Response({'message': 'Вы вышли из системы'})


@api_view(['GET'])
def me(request):
    """Информация о текущем пользователе"""
    if request.user.is_authenticated:
        return Response(UserSerializer(request.user).data)
    return Response(
        {'error': 'Не авторизован'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users(request):
    """Список пользователей (только для админа)"""
    if not request.user.is_admin:
        return Response({'error': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """Удаление пользователя (только для админа)"""
    if not request.user.is_admin:
        return Response({'error': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response({'message': 'Пользователь удален'})
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_admin(request, user_id):
    """Изменение признака is_admin (только для админа)"""
    if not request.user.is_admin:
        return Response({'error': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(id=user_id)
        user.is_admin = not user.is_admin
        user.save()
        return Response({'message': f'Статус админа изменен на {user.is_admin}'})
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)