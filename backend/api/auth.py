import hashlib
import secrets

from rest_framework.permissions import BasePermission

from .models import ApiUser


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def get_bearer_token(request):
    auth_header = request.headers.get("Authorization") or ""
    parts = auth_header.split(" ")
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def verify_token(token: str) -> bool:
    if not token:
        return False
    return ApiUser.objects.filter(token=token).exists()


def get_user_from_token(token: str):
    if not token:
        return None
    user = ApiUser.objects.filter(token=token).first()
    if not user:
        return None
    return {"username": user.username, "email": user.email}


class HasValidToken(BasePermission):
    def has_permission(self, request, view):
        token = get_bearer_token(request)
        return verify_token(token)

