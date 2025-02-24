class SpeedTracker {
    constructor() {
        this.speeds = [];
        this.watchId = null;
        this.isTracking = false;
        this.maxSpeed = 0;
        this.userId = 'Jubayer-Hossen'; // Using the current user's login

        // DOM elements
        this.speedDisplay = document.getElementById('speed');
        this.maxSpeedDisplay = document.getElementById('maxSpeed');
        this.avgSpeedDisplay = document.getElementById('avgSpeed');
        this.statusDisplay = document.getElementById('status');
        this.startButton = document.getElementById('startTracking');
        this.stopButton = document.getElementById('stopTracking');
        this.latitudeDisplay = document.getElementById('latitude');
        this.longitudeDisplay = document.getElementById('longitude');

        // Bind methods
        this.startTracking = this.startTracking.bind(this);
        this.stopTracking = this.stopTracking.bind(this);
        this.updateSpeed = this.updateSpeed.bind(this);
        this.handleError = this.handleError.bind(this);
        this.sendSpeedData = this.sendSpeedData.bind(this);

        // Add event listeners
        this.startButton.addEventListener('click', this.startTracking);
        this.stopButton.addEventListener('click', this.stopTracking);
    }

    async sendSpeedData(speed, latitude, longitude) {
        try {
            const response = await fetch('/api/speed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: this.userId,
                    speed: speed,
                    latitude: latitude,
                    longitude: longitude
                })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error sending speed data:', error);
        }
    }

    async updateStats() {
        try {
            const response = await fetch(`/api/stats/${this.userId}`);
            const stats = await response.json();
            this.maxSpeedDisplay.textContent = `${stats.max_speed.toFixed(1)} km/h`;
            this.avgSpeedDisplay.textContent = `${stats.avg_speed.toFixed(1)} km/h`;
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }

    startTracking() {
        if (!navigator.geolocation) {
            this.updateStatus('Geolocation is not supported by your browser');
            return;
        }

        this.isTracking = true;
        this.speeds = [];
        this.maxSpeed = 0;
        this.updateStatus('Initializing GPS...');
        this.startButton.disabled = true;
        this.stopButton.disabled = false;

        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        this.watchId = navigator.geolocation.watchPosition(
            this.updateSpeed,
            this.handleError,
            options
        );
    }

    stopTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.isTracking = false;
        this.startButton.disabled = false;
        this.stopButton.disabled = true;
        this.updateStatus('Tracking stopped');
    }

    updateSpeed(position) {
        if (!this.isTracking) return;

        const speed = position.coords.speed ? position.coords.speed * 3.6 : 0; // Convert m/s to km/h
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        this.speeds.push(speed);
        
        // Update displays
        this.speedDisplay.textContent = speed.toFixed(1);
        this.latitudeDisplay.textContent = `Latitude: ${latitude.toFixed(6)}`;
        this.longitudeDisplay.textContent = `Longitude: ${longitude.toFixed(6)}`;

        // Send data to backend
        this.sendSpeedData(speed, latitude, longitude);
        
        // Update stats
        this.updateStats();

        this.updateStatus('Tracking active');
    }

    handleError(error) {
        let message = 'Error occurred: ';
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message += 'Location permission denied';
                break;
            case error.POSITION_UNAVAILABLE:
                message += 'Location information unavailable';
                break;
            case error.TIMEOUT:
                message += 'Location request timed out';
                break;
            default:
                message += 'Unknown error occurred';
        }
        this.updateStatus(message);
        this.stopTracking();
    }

    updateStatus(message) {
        this.statusDisplay.textContent = message;
    }
}

// Initialize the speed tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpeedTracker();
});