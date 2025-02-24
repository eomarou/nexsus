from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from datetime import datetime
import random
import json
import os

app = Flask(__name__, static_folder='.')
CORS(app)

DATA_FILE = 'tracking_data.json'

def generate_tracking_number():
    """Generate a unique 6-digit tracking number"""
    return str(random.randint(100000, 999999))

def load_tracking_data():
    """Load tracking data from JSON file"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return []

def save_tracking_data(data):
    """Save tracking data to JSON file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/api/tracking/<tracking_number>', methods=['GET'])
def get_tracking_info(tracking_number):
    tracking_data = load_tracking_data()
    shipment = next((item for item in tracking_data if item['trackingNumber'] == tracking_number), None)
    
    if shipment:
        return jsonify(shipment)
    return jsonify({'error': 'Tracking number not found'}), 404

@app.route('/api/tracking/create', methods=['POST'])
def create_shipment():
    tracking_data = load_tracking_data()
    
    # Generate unique tracking number
    while True:
        tracking_number = generate_tracking_number()
        if not any(item['trackingNumber'] == tracking_number for item in tracking_data):
            break
    
    # Create new shipment
    new_shipment = {
        'trackingNumber': tracking_number,
        'status': 'Pending',
        'createdAt': datetime.now().isoformat(),
        'updates': [
            {
                'status': 'Pending',
                'location': 'Processing Center',
                'timestamp': datetime.now().isoformat()
            }
        ]
    }
    
    tracking_data.append(new_shipment)
    save_tracking_data(tracking_data)
    
    return jsonify(new_shipment)

@app.route('/api/tracking/update/<tracking_number>', methods=['PUT'])
def update_shipment(tracking_number):
    tracking_data = load_tracking_data()
    shipment = next((item for item in tracking_data if item['trackingNumber'] == tracking_number), None)
    
    if not shipment:
        return jsonify({'error': 'Tracking number not found'}), 404
    
    new_status = request.json.get('status')
    if new_status not in ['Pending', 'In Transit', 'Delivered']:
        return jsonify({'error': 'Invalid status'}), 400
    
    shipment['status'] = new_status
    shipment['updates'].append({
        'status': new_status,
        'location': request.json.get('location', 'Unknown'),
        'timestamp': datetime.now().isoformat()
    })
    
    save_tracking_data(tracking_data)
    return jsonify(shipment)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    # Install required packages if not already installed
    os.system('pip install flask-cors')
    app.run(port=5000, debug=True)
