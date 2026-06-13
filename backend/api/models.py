from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
import os


def user_storage_path(instance, filename):
    """Генерирует путь для сохранения файла: user_storage/user_{id}/uuid_filename.ext"""
    # Получаем расширение файла
    ext = filename.split('.')[-1] if '.' in filename else ''
    # Генерируем уникальное имя
    new_filename = f"{uuid.uuid4().hex}.{ext}" if ext else uuid.uuid4().hex
    # Формируем путь
    return f"user_storage/user_{instance.user.id}/{new_filename}"


class User(AbstractUser):
    full_name = models.CharField(max_length=255)
    is_admin = models.BooleanField(default=False)
    storage_path = models.CharField(max_length=500, blank=True, null=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        if not self.storage_path:
            self.storage_path = f"user_storage/user_{self.id if self.id else 'new'}"
        super().save(*args, **kwargs)


class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    original_name = models.CharField(max_length=255, verbose_name='Оригинальное имя')
    unique_name = models.CharField(max_length=500, unique=True, verbose_name='Уникальное имя на диске')
    size = models.BigIntegerField(verbose_name='Размер в байтах')
    comment = models.TextField(blank=True, verbose_name='Комментарий')
    upload_date = models.DateTimeField(auto_now_add=True, verbose_name='Дата загрузки')
    last_download_date = models.DateTimeField(null=True, blank=True, verbose_name='Дата последнего скачивания')
    file_path = models.CharField(max_length=1000, verbose_name='Путь к файлу на диске')
    share_link = models.CharField(max_length=100, unique=True, null=True, blank=True, verbose_name='Публичная ссылка')
    mime_type = models.CharField(max_length=100, blank=True, verbose_name='Тип файла')

    class Meta:
        db_table = 'files'
        verbose_name = 'Файл'
        verbose_name_plural = 'Файлы'
        ordering = ['-upload_date']

    def __str__(self):
        return self.original_name

    def get_file_size_display(self):
        """Человеко-читаемый размер файла"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if self.size < 1024:
                return f"{self.size:.2f} {unit}"
            self.size /= 1024
        return f"{self.size:.2f} TB"