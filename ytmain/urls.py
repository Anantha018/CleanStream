# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('search/', views.search_youtube, name='search_youtube'),
    path('audio/', views.get_audio_url, name='get_audio_url'),
    path('add-to-queue/', views.add_to_queue, name='add_to_queue'),
    path('remove-from-queue/', views.remove_from_queue, name='remove_from_queue'),
    path('get-queue/', views.get_queue, name='get_queue'),
    path('clear-queue/', views.clear_queue, name='clear-queue'),
    path('create-playlist/', views.create_playlist, name='create_playlist'),
    path('add-to-playlist/', views.add_to_playlist, name='add_to_playlist'),
    path('get-playlists/', views.get_playlists, name='get_playlists'),
    path('get-playlist-details/<int:playlist_id>/', views.get_playlist_details, name='get_playlist_details'),
    path('remove-from-playlist/', views.remove_from_playlist, name='remove_from_playlist'),
    path('delete-playlist/', views.delete_playlist, name='delete_playlist'),
    path('logout/', views.logout_view, name='logout'),
]