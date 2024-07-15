from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from yt_dlp import YoutubeDL
import requests
import requests, json
from .utils import fetch_youtube_results
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import *
from django.views.decorators.csrf import csrf_exempt


def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('search_youtube')
        else:
            messages.error(request, 'Invalid username or password')
    return render(request, 'login.html')

def register_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already taken')
        else:
            user = User.objects.create_user(username=username, password=password)
            user.save()
            messages.success(request, 'Account created successfully')
            return redirect('login')
    return render(request, 'register.html')

@csrf_exempt
def logout_view(request):
    logout(request)
    return redirect('login')

@login_required
@csrf_exempt
def search_youtube(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest' and request.method == 'GET':
        query = request.GET.get('query')
        if query:
            results = fetch_youtube_results(query)
            return JsonResponse({'results': results})
        return JsonResponse({'results': []})

    query = request.GET.get('query', '')
    results = []
    if query:
        results = fetch_youtube_results(query)

    # Render the template with results
    return render(request, 'ytmain/search.html', {'results': results, 'query': query})

@login_required
@csrf_exempt
def get_audio_url(request):
    url = request.GET.get('url', '')

    if not url:
        return JsonResponse({'error': 'URL parameter is missing'}, status=400)

    try:
        yt_url = f'https://www.youtube.com/watch?v={url}'
        ydl_opts = {
            'format': 'bestaudio/best',
            'quiet': True,
            'noplaylist': True,
            'extract_flat': True,
        }

        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(yt_url, download=False)
            audio_url = info['url']

            response = requests.head(audio_url, allow_redirects=True)
            
            if response.status_code == 200:
                return JsonResponse({'audio_url': audio_url})
            else:
                return JsonResponse({'error': 'Audio URL is not reachable'}, status=404)
    
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)


@login_required
@csrf_exempt
def add_to_queue(request):
    if request.method == 'POST':
        user = request.user
        video_url = request.POST.get('video_url')
        title = request.POST.get('title')
        # Save to the queue model with user association
        QueueItem.objects.create(user=user, video_url=video_url, title=title)
        return JsonResponse({'status': 'success'})
    
@login_required
@csrf_exempt
def remove_from_queue(request):
    if request.method == 'POST':
        user = request.user
        title = request.POST.get('title')
        # Remove the item from the user's queue in the database
        rows_deleted = QueueItem.objects.filter(user=user, title=title).delete()
        if rows_deleted[0] > 0:
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Item not found or not owned by user'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def get_queue(request):
    user = request.user
    # Assuming you have a Queue model with a ForeignKey to the User model
    queue_items = QueueItem.objects.filter(user=user)
    data = {
        'status': 'success',
        'queue': list(queue_items.values('video_url', 'title'))
    }
    return JsonResponse(data)

@login_required
@csrf_exempt
def clear_queue(request):
    if request.method == 'POST':
        QueueItem.objects.filter(user=request.user).delete()
        return JsonResponse({'status': 'success', 'message': 'Queue cleared'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def create_playlist(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        if name:
            # Check if a playlist with the same name exists
            existing_playlist = Playlist.objects.filter(user=request.user, name=name).first()
            if existing_playlist:
                return JsonResponse({'status': 'error', 'message': 'Playlist already exists'})
            else:
                playlist = Playlist.objects.create(user=request.user, name=name)
                return JsonResponse({'status': 'success', 'playlist_id': playlist.id})
        return JsonResponse({'status': 'error', 'message': 'Invalid name'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def add_to_playlist(request):
    if request.method == 'POST':
        playlist_id = request.POST.get('playlist_id')
        video_url = request.POST.get('video_url')
        title = request.POST.get('title')

        if not playlist_id or not video_url or not title:
            return JsonResponse({'status': 'error', 'message': 'Missing data'})

        try:
            playlist = Playlist.objects.get(id=playlist_id)
            # Check for duplicates
            if PlaylistItem.objects.filter(playlist=playlist, video_url=video_url).exists():
                return JsonResponse({'status': 'error', 'message': 'Item already exists in the playlist'})

            PlaylistItem.objects.create(playlist=playlist, video_url=video_url, title=title)
            return JsonResponse({'status': 'success'})
        except Playlist.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Playlist not found'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def get_playlists(request):
    playlists = Playlist.objects.filter(user=request.user)
    playlist_data = [{'id': playlist.id, 'name': playlist.name} for playlist in playlists]
    return JsonResponse({'playlists': playlist_data})

@login_required
@csrf_exempt
def get_playlist_details(request, playlist_id):
    try:
        playlist = Playlist.objects.get(id=playlist_id, user=request.user)
        items = PlaylistItem.objects.filter(playlist=playlist).order_by('id')  # Sort by id in ascending order

        data = {
            'name': playlist.name,
            'items': list(items.values('id', 'title', 'video_url')),  # Include 'id' for better identification
        }
        return JsonResponse(data)
    except Playlist.DoesNotExist:
        return JsonResponse({'error': 'Playlist not found'}, status=404)


@login_required
@csrf_exempt
def remove_from_playlist(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            playlistId = data.get('playlistId')
            videoUrl = data.get('videoUrl')
            item = PlaylistItem.objects.filter(playlist_id=playlistId, video_url=videoUrl)
            item.delete()
            return JsonResponse({'status': 'success'})
        except PlaylistItem.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Item not found'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


@login_required
@csrf_exempt
def delete_playlist(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            if not name:
                return JsonResponse({'status': 'error', 'message': 'Playlist name is required'}, status=400)
            
            item = Playlist.objects.get(name=name)
            item.delete()
            return JsonResponse({'status': 'success'})
        except PlaylistItem.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Item not found'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def csrf_failure(request, reason=""):
    return render(request, 'csrf_error.html')