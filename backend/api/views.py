from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.utils import timezone
from django.db import connection

from .auth import (
    HasValidToken,
    generate_token,
    get_bearer_token,
    get_user_from_token,
    hash_password,
    verify_token,
)
from .models import ApiUser
from .recipes_data import RECIPES
from .scheduler import schedule_recipes


class HealthView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            return Response({"status": "ok", "message": "Backend and SQLite are running"})
        except Exception as e:
            return Response(
                {"status": "error", "message": f"SQLite connection error: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class RegisterView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        data = request.data or {}
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return Response({"message": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)
        if len(password) < 6:
            return Response(
                {"message": "Password must be at least 6 characters"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if ApiUser.objects.filter(username=username).exists():
            return Response({"message": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
        if ApiUser.objects.filter(email=email).exists():
            return Response({"message": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        token = generate_token()
        ApiUser.objects.create(
            username=username,
            email=email,
            password_hash=hash_password(password),
            token=token,
        )
        return Response(
            {"message": "Registration successful", "token": token, "username": username},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        data = request.data or {}
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return Response({"message": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = ApiUser.objects.filter(username=username).first()
        if not user or user.password_hash != hash_password(password):
            return Response({"message": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)

        token = generate_token()
        user.token = token
        user.last_login_at = timezone.now()
        user.save(update_fields=["token", "last_login_at"])
        return Response({"message": "Login successful", "token": token, "username": username})


class LogoutView(APIView):
    permission_classes = [HasValidToken]

    def post(self, request):
        token = get_bearer_token(request)
        if token:
            user = ApiUser.objects.filter(token=token).first()
            if user:
                user.token = ""
                user.save(update_fields=["token"])
        return Response({"message": "Logout successful"})


class VerifyView(APIView):
    permission_classes = [HasValidToken]

    def get(self, request):
        token = get_bearer_token(request)
        if token and verify_token(token):
            user = get_user_from_token(token)
            if user:
                return Response({"valid": True, "username": user["username"]})
        return Response({"valid": False}, status=status.HTTP_401_UNAUTHORIZED)


class RecipesView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response(RECIPES)


class RecipeDetailView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, recipe_name: str):
        recipe = RECIPES.get(recipe_name)
        if not recipe:
            return Response({"message": "Recipe not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(recipe)


class ResourcesView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        resource_limits = {"countertop": 5, "grill": 1, "stove": 3, "toaster": 1, "fryer": 2}
        return Response({k: {"total": v, "available": v} for k, v in resource_limits.items()})


class ScheduleView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        # Default: schedule all recipes.
        selected = list(RECIPES.keys())
        return Response(schedule_recipes(RECIPES, selected))

    def post(self, request):
        data = request.data or {}
        selected = data.get("selectedRecipes") or data.get("selected_recipes") or []
        if not isinstance(selected, list):
            return Response({"message": "selectedRecipes must be a list"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(schedule_recipes(RECIPES, selected))

