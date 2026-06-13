import os
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.http import FileResponse, Http404
from django.utils import timezone  # ← ДОБАВЛЕНО!
from rest_framework.parsers import MultiPartParser, FormParser
from .models import File
from .serializers import FileSerializer
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes  # ← ДОБАВЛЕН parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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


@api_view(['POST'])
def make_admin(request, username):
    """Временный эндпоинт для назначения админа"""
    try:
        user = User.objects.get(username=username)
        user.is_admin = True
        user.save()
        return Response({'message': f'{username} теперь админ'})
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_files(request):
    """Получить список файлов пользователя (админ видит все)"""
    target_user_id = request.query_params.get('user_id')

    if request.user.is_admin and target_user_id:
        files = File.objects.filter(user_id=target_user_id)
    else:
        files = File.objects.filter(user=request.user)

    serializer = FileSerializer(files, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_file(request):
    """Загрузка файла"""
    file_obj = request.FILES.get('file')
    if not file_obj:
        return Response({'error': 'Файл не предоставлен'}, status=status.HTTP_400_BAD_REQUEST)

    comment = request.data.get('comment', '')

    # Создаем запись в БД
    file_record = File(
        user=request.user,
        original_name=file_obj.name,
        unique_name=f"{uuid.uuid4().hex}_{file_obj.name}",
        size=file_obj.size,
        comment=comment,
        file_path=f"user_storage/user_{request.user.id}/{file_obj.name}",
        mime_type=file_obj.content_type
    )

    # Сохраняем файл на диск
    save_path = os.path.join(settings.MEDIA_ROOT, f"user_storage/user_{request.user.id}", file_obj.name)
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    with open(save_path, 'wb+') as destination:
        for chunk in file_obj.chunks():
            destination.write(chunk)

    file_record.save()
    serializer = FileSerializer(file_record)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_file(request, file_id):
    """Удаление файла"""
    try:
        file_record = File.objects.get(id=file_id)

        if not request.user.is_admin and file_record.user != request.user:
            return Response({'error': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        file_path = os.path.join(settings.MEDIA_ROOT, file_record.file_path)
        if os.path.exists(file_path):
            os.remove(file_path)

        file_record.delete()
        return Response({'message': 'Файл удален'})
    except File.DoesNotExist:
        return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def rename_file(request, file_id):
    """Переименование файла"""
    try:
        file_record = File.objects.get(id=file_id)

        if not request.user.is_admin and file_record.user != request.user:
            return Response({'error': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        new_name = request.data.get('original_name')
        if not new_name:
            return Response({'error': 'Новое имя не предоставлено'}, status=status.HTTP_400_BAD_REQUEST)

        file_record.original_name = new_name
        file_record.save()

        serializer = FileSerializer(file_record)
        return Response(serializer.data)
    except File.DoesNotExist:
        return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_file(request, file_id):
    """Скачивание файла"""
    try:
        file_record = File.objects.get(id=file_id)

        if not request.user.is_admin and file_record.user != request.user:
            return Response({'error': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        # Обновляем дату последнего скачивания
        from django.utils import timezone
        file_record.last_download_date = timezone.now()
        file_record.save()

        file_path = os.path.join(settings.MEDIA_ROOT, file_record.file_path)
        if not os.path.exists(file_path):
            return Response({'error': 'Файл не найден на диске'}, status=status.HTTP_404_NOT_FOUND)

        response = FileResponse(open(file_path, 'rb'), content_type=file_record.mime_type)
        response['Content-Disposition'] = f'attachment; filename="{file_record.original_name}"'
        return response
    except File.DoesNotExist:
        return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_share_link(request, file_id):
    """Генерация публичной ссылки для файла"""
    try:
        file_record = File.objects.get(id=file_id)

        if not request.user.is_admin and file_record.user != request.user:
            return Response({'error': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        share_token = uuid.uuid4().hex[:16]
        file_record.share_link = share_token
        file_record.save()

        return Response({'share_link': f"/api/share/{share_token}/"})
    except File.DoesNotExist:
        return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def public_download(request, token):
    """Скачивание файла по публичной ссылке (без авторизации)"""
    try:
        file_record = File.objects.get(share_link=token)

        file_path = os.path.join(settings.MEDIA_ROOT, file_record.file_path)
        if not os.path.exists(file_path):
            return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)

        response = FileResponse(open(file_path, 'rb'), content_type=file_record.mime_type)
        response['Content-Disposition'] = f'attachment; filename="{file_record.original_name}"'
        return response
    except File.DoesNotExist:
        return Response({'error': 'Ссылка недействительна'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_comment(request, file_id):
    """Обновление комментария к файлу"""
    try:
        file_record = File.objects.get(id=file_id)

        if not request.user.is_admin and file_record.user != request.user:
            return Response({'error': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        comment = request.data.get('comment', '')
        file_record.comment = comment
        file_record.save()

        serializer = FileSerializer(file_record)
        return Response(serializer.data)
    except File.DoesNotExist:
        return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)