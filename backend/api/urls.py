from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello),  # твой старый тест
    path('register/', views.register),
    path('login/', views.login_view),
    path('logout/', views.logout_view),
    path('me/', views.me),
    path('users/', views.get_users),
    path('users/<int:user_id>/', views.delete_user),
    path('users/<int:user_id>/toggle-admin/', views.toggle_admin),
    path('make-admin/<str:username>/', views.make_admin),
]