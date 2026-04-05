from django.urls import path

from .views import (
    HealthView,
    LoginView,
    LogoutView,
    RegisterView,
    RecipeDetailView,
    RecipesView,
    ResourcesView,
    ScheduleView,
    VerifyView,
)

urlpatterns = [
    path("health", HealthView.as_view()),
    path("auth/register", RegisterView.as_view()),
    path("auth/login", LoginView.as_view()),
    path("auth/logout", LogoutView.as_view()),
    path("auth/verify", VerifyView.as_view()),
    path("recipes", RecipesView.as_view()),
    path("recipes/<str:recipe_name>", RecipeDetailView.as_view()),
    path("resources", ResourcesView.as_view()),
    path("schedule", ScheduleView.as_view()),
]

