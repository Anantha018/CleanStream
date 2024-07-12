from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('adminsitekavalientra/', admin.site.urls),
    path('',include('ytmain.urls')),
]
