from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('hello/', views.hello),
    path('register/', views.register),
    path('login/', views.login_view),
    path('logout/', views.logout_view),
    path('me/', views.me),

    # Admin
    path('users/', views.get_users),
    path('users/<int:user_id>/', views.delete_user),
    path('users/<int:user_id>/toggle-admin/', views.toggle_admin),
    path('users/<int:user_id>/storage-limit/', views.update_storage_limit),

    path('storage/info/', views.get_storage_info),
    path('storage/info/<int:user_id>/', views.get_storage_info_for_user),

    path('make-admin/<str:username>/', views.make_admin),

    # Files
    path('files/', views.get_files),
    path('files/upload/', views.upload_file),
    path('files/<int:file_id>/', views.delete_file),
    path('files/<int:file_id>/rename/', views.rename_file),
    path('files/<int:file_id>/comment/', views.update_comment),
    path('files/<int:file_id>/download/', views.download_file),
    path('files/<int:file_id>/share/', views.generate_share_link),

    # Public share
    path('share/<str:token>/', views.public_download, name='public_download'),
]

