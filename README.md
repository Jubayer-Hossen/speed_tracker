# Speed Tracker

![Last Updated](https://img.shields.io/badge/last%20updated-2025--02--24-blue)
[![Author](https://img.shields.io/badge/author-Jubayer--Hossen-green)](https://github.com/Jubayer-Hossen)

A real-time speed tracking application that uses GPS to monitor and record movement speed. Built with Python Flask backend and modern web frontend.

## 🌟 Features

- Real-time speed tracking using GPS
- Speed measurement in kilometers per hour (km/h)
- Maximum and average speed tracking
- Persistent data storage using SQLite
- Responsive modern UI design
- Location coordinates display
- Historical data tracking
- REST API endpoints

## 🚀 Live Demo

Visit the live application at: [Speed Tracker App](https://speed-tracker-1kd7.onrender.com)

## 🛠️ Technologies Used

- **Backend:**
  - Python 3.9+
  - Flask
  - SQLAlchemy
  - SQLite

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Geolocation API

- **Deployment:**
  - Render.com
  - Gunicorn

## 📋 Prerequisites

- Python 3.9 or higher
- Git
- Modern web browser with GPS capabilities
- pip (Python package manager)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/Jubayer-Hossen/speed-tracker.git
cd speed-tracker
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Create a .env file and add:
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
```

5. Initialize the database:
```bash
python
>>> from app import db
>>> db.create_all()
>>> exit()
```

## 🎮 Usage

1. Start the development server:
```bash
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

3. Allow location access when prompted
4. Click "Start Tracking" to begin monitoring your speed

## 📱 Mobile Usage

For best results:
- Use a device with GPS capabilities
- Enable high-accuracy location services
- Use outdoors with clear sky view
- Keep the screen active while tracking

## 🔌 API Endpoints

### Record Speed
```http
POST /api/speed
```
```json
{
    "user_id": "string",
    "speed": "float",
    "latitude": "float",
    "longitude": "float"
}
```

### Get Statistics
```http
GET /api/stats/<user_id>
```
```json
{
    "max_speed": "float",
    "avg_speed": "float",
    "total_records": "integer"
}
```

## 🏗️ Project Structure

```
speed_tracker/
│
├── static/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── script.js
│
├── templates/
│   └── index.html
│
├── app.py
├── config.py
├── requirements.txt
└── README.md
```

## 🚨 Known Limitations

- Speed tracking requires GPS hardware
- Desktop browsers may not provide speed data
- Free tier hosting may have periodic spin-down
- SQLite database resets on each deploy

## 🛟 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/Jubayer-Hossen/speed-tracker/issues).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Flask Documentation](https://flask.palletsprojects.com/)
- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Render.com Documentation](https://render.com/docs)

## 📊 Project Status

![GitHub last commit](https://img.shields.io/github/last-commit/Jubayer-Hossen/speed-tracker)

Last Updated: 2025-02-24 20:59:58 UTC

---
Created with ❤️ by [Jubayer-Hossen](https://github.com/Jubayer-Hossen)