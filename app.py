from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from config import Config
import os

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)

class SpeedRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False)
    speed = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'speed': self.speed,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'timestamp': self.timestamp.isoformat()
        }

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/speed', methods=['POST'])
def record_speed():
    data = request.json
    new_record = SpeedRecord(
        user_id=data.get('user_id', 'anonymous'),
        speed=data['speed'],
        latitude=data['latitude'],
        longitude=data['longitude']
    )
    db.session.add(new_record)
    db.session.commit()
    return jsonify(new_record.to_dict()), 201

@app.route('/api/stats/<user_id>')
def get_stats(user_id):
    records = SpeedRecord.query.filter_by(user_id=user_id).all()
    if not records:
        return jsonify({
            'max_speed': 0,
            'avg_speed': 0,
            'total_records': 0
        })
    
    speeds = [r.speed for r in records]
    return jsonify({
        'max_speed': max(speeds),
        'avg_speed': sum(speeds) / len(speeds),
        'total_records': len(records)
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)