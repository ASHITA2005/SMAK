from django.urls import path, include, re_path

from .views import spa_index

urlpatterns = [
    path("api/", include("api.urls")),
    # Serve React SPA (built) for all non-API routes
    re_path(r"^(?!api/).*$", spa_index),
]

