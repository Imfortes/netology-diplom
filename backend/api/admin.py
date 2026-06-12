from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'full_name', 'is_admin', 'is_staff')
    list_editable = ('is_admin', 'is_staff')
    search_fields = ('username', 'email', 'full_name')
