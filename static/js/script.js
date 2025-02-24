// Add this at the beginning of your existing script.js file
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggling functionality
    const themeToggle = document.getElementById('themeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial theme based on user preference
    if (prefersDarkScheme.matches) {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.body.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });

    // Add this to your SpeedTracker class
    const speedDisplay = document.querySelector('.speed-display');
    
    // Modify your startTracking method to add the tracking class
    const originalStartTracking = SpeedTracker.prototype.startTracking;
    SpeedTracker.prototype.startTracking = function() {
        speedDisplay.classList.add('tracking');
        originalStartTracking.call(this);
    };

    // Modify your stopTracking method to remove the tracking class
    const originalStopTracking = SpeedTracker.prototype.stopTracking;
    SpeedTracker.prototype.stopTracking = function() {
        speedDisplay.classList.remove('tracking');
        originalStopTracking.call(this);
    };
});

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
        this.mphConversion = document.querySelector('#mphConversion .conversion-value');
        this.msConversion = document.querySelector('#msConversion .conversion-value');

        // Bind methods
        this.startTracking = this.startTracking.bind(this);
        this.stopTracking = this.stopTracking.bind(this);
        this.updateSpeed = this.updateSpeed.bind(this);
        this.handleError = this.handleError.bind(this);
        this.sendSpeedData = this.sendSpeedData.bind(this);

        // Add event listeners
        this.startButton.addEventListener('click', this.startTracking);
        this.stopButton.addEventListener('click', this.stopTracking);

        // Add conversion buttons
        const conversionButtons = document.querySelectorAll('.conversion-btn');
        conversionButtons.forEach(button => {
            button.addEventListener('click', () => this.toggleConversion(button.dataset.unit));
        });

        // Track active conversion
        this.activeConversions = {
            mph: false,
            ms: false
        };

        // Conversion factors
        this.conversions = {
            mph: 0.621371, // km/h to mph
            ms: 0.277778   // km/h to m/s
        };
    }

    toggleConversion(unit) {
        this.activeConversions[unit] = !this.activeConversions[unit];
        const button = document.querySelector(`[data-unit="${unit}"]`);
        
        if (this.activeConversions[unit]) {
            button.style.background = 'var(--primary-color)';
            button.style.color = 'white';
            button.innerHTML = `<i class="fas fa-times"></i> Hide ${unit.toUpperCase()}`;
        } else {
            button.style.background = 'transparent';
            button.style.color = 'var(--primary-color)';
            button.innerHTML = `<i class="${unit === 'mph' ? 'fas fa-tachometer-alt' : 'fas fa-wind'}"></i> Convert to ${unit.toUpperCase()}`;
        }
        
        // Update conversion displays
        this.updateConversions(parseFloat(this.speedDisplay.textContent));
    }

    updateConversions(speedKmh) {
        if (this.activeConversions.mph) {
            const mph = speedKmh * this.conversions.mph;
            this.mphConversion.textContent = `${mph.toFixed(1)} mph`;
        } else {
            this.mphConversion.textContent = '0 mph';
        }

        if (this.activeConversions.ms) {
            const ms = speedKmh * this.conversions.ms;
            this.msConversion.textContent = `${ms.toFixed(1)} m/s`;
        } else {
            this.msConversion.textContent = '0 m/s';
        }
    }

    updateSpeed(position) {
        if (!this.isTracking) return;

        const speed = position.coords.speed ? position.coords.speed * 3.6 : 0; // Convert m/s to km/h
        this.speeds.push(speed);
        
        // Update current speed
        this.speedDisplay.textContent = speed.toFixed(1);

        // Update conversions
        this.updateConversions(speed);

        // Update max speed
        if (speed > this.maxSpeed) {
            this.maxSpeed = speed;
            this.maxSpeedDisplay.textContent = `${speed.toFixed(1)} km/h`;
        }

        // Update average speed
        const avgSpeed = this.speeds.reduce((a, b) => a + b, 0) / this.speeds.length;
        this.avgSpeedDisplay.textContent = `${avgSpeed.toFixed(1)} km/h`;

        this.updateStatus('Tracking active');
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