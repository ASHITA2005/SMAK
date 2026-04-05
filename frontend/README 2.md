# Smart Kitchen Frontend

A modern React frontend for the SMAK (Smart Kitchen) application.

## Features

- 🍔 **Recipe Browser**: Browse and view detailed information about recipes
- 📊 **Task Scheduler**: Visualize task scheduling with timeline view
- 🔧 **Resource Monitor**: Real-time monitoring of kitchen resources
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations

## Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── RecipeBrowser.jsx
│   │   ├── RecipeDetails.jsx
│   │   ├── TaskScheduler.jsx
│   │   └── ResourceMonitor.jsx
│   ├── services/         # API services
│   │   └── api.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── package.json
└── vite.config.js
```

## API Integration

The frontend is configured to work with the backend API running on `http://localhost:5000`. The API service includes mock data for development when the backend is not available.

## Available Routes

- `/` - Recipe browser
- `/recipe/:recipeName` - Recipe details view
- `/scheduler` - Task scheduler timeline
- `/resources` - Resource monitor

## Technologies Used

- React 18
- React Router DOM
- Vite
- Axios
