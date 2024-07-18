from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-=9%aws+k7*izh&br_-l)&2(wt@3c%l8_97zet7smtzyileera*'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

CSRF_COOKIE_DOMAIN = 'cleanstream.site'
CSRF_TRUSTED_ORIGINS = [
    'https://cleanstream-production.up.railway.app',
    'https://cleanstream.site',
]

ALLOWED_HOSTS = [
    'cleanstream-production.up.railway.app',
    'cleanstream.site',
    '*'
]

# Application definition

INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'ytmain',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',  
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# Configure CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://cleanstream-production.up.railway.app",
    "https://cleanstream.site",
]

CORS_ALLOW_CREDENTIALS = True

CSRF_COOKIE_SECURE = True  # Ensure CSRF cookie is secure in production
SESSION_COOKIE_SECURE = True  # Ensure session cookie is secure in production


ROOT_URLCONF = 'ytbase.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'ytmain/templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ytbase.wsgi.application'

# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'railway',
        'USER': 'postgres',
        'PASSWORD': 'ZOXpwXxwKbtKLaQeKUODzhfzYuNXToqN',
        'HOST': 'roundhouse.proxy.rlwy.net',
        'PORT': '45793',
    }
}

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/

CSRF_FAILURE_VIEW = 'ytmain.views.csrf_failure'


STATIC_URL = '/static/'

# Define the path for static files
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'ytmain/static'),
]

# Add the STATIC_ROOT setting
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Login URL
LOGIN_URL = 'login'
