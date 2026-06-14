from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
import os


def user_storage_path(instance, filename):
    """Генерирует путь для сохранения файла"""
    ext = filename.split('.')[-1] if '.' in filename else ''
    new_filename = f"{uuid.uuid4().hex}.{ext}" if ext else uuid.uuid4().hex
    return f"user_storage/user_{instance.user.id}/{new_filename}"


class User(AbstractUser):
    full_name = models.CharField(max_length=255)
    is_admin = models.BooleanField(default=False)
    storage_path = models.CharField(max_length=500, blank=True, null=True)

    # Новые поля для лимитов
    storage_limit = models.BigIntegerField(default=1073741824)  # 1 GB в байтах
    storage_used = models.BigIntegerField(default=0)  # Использовано байт

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        if not self.storage_path:
            self.storage_path = f"user_storage/user_{self.id if self.id else 'new'}"
        super().save(*args, **kwargs)

    def get_free_space(self):
        """Возвращает свободное место в байтах"""
        return self.storage_limit - self.storage_used

    def has_space_for(self, file_size):
        """Проверяет, есть ли место для файла"""
        return self.get_free_space() >= file_size


class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    original_name = models.CharField(max_length=255)
    unique_name = models.CharField(max_length=500, unique=True)
    size = models.BigIntegerField()
    comment = models.TextField(blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    last_download_date = models.DateTimeField(null=True, blank=True)
    file_path = models.CharField(max_length=1000)
    share_link = models.CharField(max_length=100, unique=True, null=True, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'files'
        ordering = ['-upload_date']