from django.db import models
from django.contrib.auth.models import User

class QueueItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    video_url = models.URLField()
    title = models.CharField(max_length=255)

    class Meta:
        unique_together = ('user', 'video_url')  # Ensure uniqueness of user and video_url combination

    def __str__(self):
        return self.title

class Playlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class PlaylistItem(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
    video_url = models.URLField()
    title = models.CharField(max_length=255)

    class Meta:
        unique_together = ('playlist', 'video_url')  # Ensure uniqueness of playlist and video_url combination

    def __str__(self):
        return self.title
