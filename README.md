# SMAK - Smart Kitchen Application

A full-stack application for managing kitchen recipes, task scheduling, and resource monitoring.

## Features

- 🔐 **User Authentication**: Login and registration system
- 🍔 **Recipe Browser**: Browse and view detailed information about recipes
- 📊 **Task Scheduler**: Visualize task scheduling with timeline view
- 🔧 **Resource Monitor**: Real-time monitoring of kitchen resources
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations

## Prerequisites

Before running the project, make sure you have the following installed:

- **Python 3.8+** (for backend)
- **Node.js 16+** and **npm** (for frontend)
- **MongoDB** (running locally on `mongodb://127.0.0.1:27017`)

### Installing MongoDB

**Windows:**
- Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- Install and start MongoDB service

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

## Project Structure

```
SMAK/
├── backend/          # Flask backend API
│   ├── app.py        # Main Flask application
│   ├── recipes.py    # Recipe data
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── services/
│   └── package.json
└── README.md
```

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Make sure MongoDB is running:
   - Check if MongoDB service is running
   - Default connection: `mongodb://127.0.0.1:27017`

### 2. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

## Running the Project

### Step 1: Start MongoDB

Make sure MongoDB is running on your system. You can verify by checking if the MongoDB service is active.

### Step 2: Start the Backend Server

Open a terminal and run:

```bash
cd backend
python app.py
```

You should see:
```
✓ MongoDB connection successful
 * Running on http://127.0.0.1:5000
```

The backend API will be available at `http://localhost:5000`

**Note:** If you see a MongoDB connection error, make sure MongoDB is installed and running.

### Step 3: Start the Frontend Development Server

Open a **new terminal** (keep the backend running) and run:

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

The frontend will be available at `http://localhost:3000`

## Using the Application

1. **Open your browser** and navigate to `http://localhost:3000`

2. **Login Page**: You'll be redirected to the login page (`/login`)

3. **Register a New Account**:
   - Click "Register" or toggle to registration mode
   - Enter username, email, and password (minimum 6 characters)
   - Click "Register"

4. **Login**:
   - Enter your username and password
   - Click "Login"

5. **Navigate the App**:
   - **Recipes**: Browse available recipes
   - **Start Session**: Select recipes for a cooking session
   - **Scheduler**: View task scheduling timeline
   - **Resources**: Monitor kitchen resources

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```
✗ MongoDB connection error: ...
```
- Make sure MongoDB is installed and running
- Check if MongoDB service is active
- Verify connection string: `mongodb://127.0.0.1:27017`

**Port Already in Use:**
- If port 5000 is already in use, change it in `backend/app.py`:
  ```python
  app.run(debug=True, port=5001)  # Change to different port
  ```

### Frontend Issues

**Network Error on Login/Register:**
- Make sure the backend server is running on `http://localhost:5000`
- Check the browser console (F12) for detailed error messages
- Verify the proxy configuration in `frontend/vite.config.js`

**npm install fails:**
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- Make sure you have Node.js 16+ installed

**Port 3000 Already in Use:**
- Vite will automatically use the next available port
- Or change it in `frontend/vite.config.js`

### General Issues

**CORS Errors:**
- The backend has CORS enabled, but if you see CORS errors, check `backend/app.py` for CORS configuration

**Module Not Found:**
- Backend: Make sure you've activated the virtual environment and installed requirements
- Frontend: Make sure you've run `npm install` in the frontend directory

## Development

### Backend API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify authentication token

### Frontend Routes

- `/login` - Login/Register page
- `/` - Recipe browser (protected)
- `/select` - Recipe selector (protected)
- `/recipe/:recipeName` - Recipe details (protected)
- `/scheduler` - Task scheduler (protected)
- `/resources` - Resource monitor (protected)

## Production Build

### Build Frontend for Production

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

### Run Production Backend

For production, use a proper WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Technologies Used

### Backend
- Flask - Web framework
- MongoDB - Database
- PyMongo - MongoDB driver
- Flask-CORS - CORS support

### Frontend
- React 18 - UI library
- React Router DOM - Routing
- Vite - Build tool
- Axios - HTTP client

## License

This project is for educational purposes.
