from django.contrib import admin
from .models import *

@admin.register(QueueItem)
class QueueItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'video_url', 'title')


admin.site.register(Playlist)
admin.site.register(PlaylistItem)