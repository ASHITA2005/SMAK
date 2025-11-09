from flask import Flask, request, jsonify
from flask_cors import CORS
import pymongo
import hashlib
import secrets
from functools import wraps
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# MongoDB connection with error handling
try:
    client = pymongo.MongoClient("mongodb://127.0.0.1:27017", serverSelectionTimeoutMS=5000)
    # Test connection
    client.server_info()
    database = client["authenticate"]
    collection = database["authenticate_collection"]
    print("✓ MongoDB connection successful")
except Exception as e:
    print(f"✗ MongoDB connection error: {e}")
    print("Please make sure MongoDB is running on mongodb://127.0.0.1:27017")
    client = None
    database = None
    collection = None

# Secret key for token generation (in production, use environment variable)
SECRET_KEY = "your-secret-key-change-in-production"

def hash_password(password):
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token():
    """Generate a simple token"""
    return secrets.token_urlsafe(32)

def verify_token(token):
    """Verify token exists in database"""
    user = collection.find_one({"token": token})
    return user is not None

def get_user_from_token(token):
    """Get user from token"""
    user = collection.find_one({"token": token})
    if user:
        return {
            "username": user.get("username"),
            "email": user.get("email")
        }
    return None

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({"message": "Invalid token format"}), 401
        
        if not token or not verify_token(token):
            return jsonify({"message": "Authentication required"}), 401
        
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        if client is None:
            return jsonify({
                "status": "error",
                "message": "MongoDB not connected"
            }), 503
        
        # Test MongoDB connection
        client.server_info()
        return jsonify({
            "status": "ok",
            "message": "Backend and MongoDB are running"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"MongoDB connection error: {str(e)}"
        }), 503

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        if client is None or collection is None:
            return jsonify({"message": "Database connection error. Please check MongoDB."}), 503
        
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return jsonify({"message": "All fields are required"}), 400

        if len(password) < 6:
            return jsonify({"message": "Password must be at least 6 characters"}), 400

        # Check if user already exists
        if collection.find_one({"username": username}):
            return jsonify({"message": "Username already exists"}), 400

        if collection.find_one({"email": email}):
            return jsonify({"message": "Email already exists"}), 400

        # Hash password and create user
        hashed_password = hash_password(password)
        token = generate_token()

        user_data = {
            "username": username,
            "email": email,
            "password": hashed_password,
            "token": token,
            "created_at": datetime.utcnow().isoformat()
        }

        collection.insert_one(user_data)

        return jsonify({
            "message": "Registration successful",
            "token": token,
            "username": username
        }), 201

    except Exception as e:
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        if client is None or collection is None:
            return jsonify({"message": "Database connection error. Please check MongoDB."}), 503
        
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400

        # Find user
        user = collection.find_one({"username": username})
        if not user:
            return jsonify({"message": "Invalid username or password"}), 401

        # Verify password
        hashed_password = hash_password(password)
        if user.get("password") != hashed_password:
            return jsonify({"message": "Invalid username or password"}), 401

        # Generate new token
        token = generate_token()
        collection.update_one(
            {"username": username},
            {"$set": {"token": token, "last_login": datetime.utcnow().isoformat()}}
        )

        return jsonify({
            "message": "Login successful",
            "token": token,
            "username": username
        }), 200

    except Exception as e:
        return jsonify({"message": f"Login failed: {str(e)}"}), 500

@app.route('/api/auth/logout', methods=['POST'])
@require_auth
def logout():
    try:
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(' ')[1] if auth_header else None

        if token:
            # Invalidate token by removing it
            collection.update_one(
                {"token": token},
                {"$unset": {"token": ""}}
            )

        return jsonify({"message": "Logout successful"}), 200

    except Exception as e:
        return jsonify({"message": f"Logout failed: {str(e)}"}), 500

@app.route('/api/auth/verify', methods=['GET'])
@require_auth
def verify():
    try:
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(' ')[1] if auth_header else None

        if token:
            user = get_user_from_token(token)
            if user:
                return jsonify({
                    "valid": True,
                    "username": user["username"]
                }), 200

        return jsonify({"valid": False}), 401

    except Exception as e:
        return jsonify({"valid": False, "message": str(e)}), 401

if __name__ == '__main__':
    app.run(debug=True, port=5000)
