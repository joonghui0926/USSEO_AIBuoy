"""
/************************************************************************************************
 * Organization  : LognCoding
 * Project       : AI Rescue Buoy
 * Author        : Joonghui Cho
 *
 * System        : Raspberry Pi
 * OS            : Raspberry Pi OS
 *
 * Description:
 * This script operates as the central control hub for the AI Rescue Buoy.
 * It runs a YOLOv8 Nano object detection model on a live webcam feed to detect persons in the water.
 * The script computes steering and throttle control values based on the target's position and distance.
 * It features a Flask-based MJPEG video streaming server for low-latency web dashboard monitoring.
 * Additionally, it handles two-way UART serial communication with an Arduino Mega to send physical 
 * motor commands and receive sensor telemetry (GPS, Heading), syncing all data with Firebase.
************************************************************************************************/
"""

import cv2
import serial
import time
import threading
from flask import Flask, Response
from flask_cors import CORS
from ultralytics import YOLO
import firebase_admin
from firebase_admin import credentials, db

app = Flask(__name__)
CORS(app)

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {'databaseURL': 'https://airescuebuoy.firebaseio.com/'})

ser = serial.Serial('/dev/ttyACM0', 115200, timeout=1)
model = YOLO("yolov8n.pt")
cap = cv2.VideoCapture(0)
cap.set(3, 640)
cap.set(4, 480)

current_frame = None
control_mode = "AUTO"
manual_throttle = 1000
manual_steering = 90

def db_listener(event):
    global control_mode, manual_throttle, manual_steering
    data = db.reference('buoys/buoy_01/control').get()
    if data:
        control_mode = data.get("mode", "AUTO")
        manual_throttle = data.get("throttle", 1000)
        manual_steering = data.get("steering", 90)

db.reference('buoys/buoy_01/control').listen(db_listener)

def generate_frames():
    global current_frame
    while True:
        if current_frame is not None:
            ret, buffer = cv2.imencode('.jpg', current_frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.03)

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

def serial_read_loop():
    while True:
        if ser.in_waiting > 0:
            try:
                line = ser.readline().decode('utf-8').strip()
                if line.startswith('<') and line.endswith('>'):
                    data = line[1:-1].split(',')
                    if len(data) == 3:
                        lat = float(data[0])
                        lon = float(data[1])
                        heading = float(data[2])
                        db.reference('buoys/buoy_01/telemetry').update({
                            'latitude': lat,
                            'longitude': lon,
                            'heading': heading
                        })
            except:
                pass
        time.sleep(0.05)

def buoy_core_loop():
    global current_frame, control_mode, manual_throttle, manual_steering
    
    FRAME_CENTER_X = 320
    Kp = 0.1
    base_throttle = 1500
    stop_throttle = 1000

    while True:
        ret, frame = cap.read()
        if not ret: continue

        results = model(frame, stream=True, verbose=False)
        target_detected = False
        error_x = 0
        box_width = 0

        for r in results:
            for box in r.boxes:
                if int(box.cls[0]) == 0:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    center_x = (x1 + x2) // 2
                    box_width = x2 - x1
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                    error_x = center_x - FRAME_CENTER_X
                    target_detected = True
                    break
            if target_detected: break

        current_frame = frame.copy()

        db.reference('buoys/buoy_01/status').update({
            'is_person_detected': target_detected
        })

        throttle = stop_throttle
        steering = 90

        if control_mode == "AUTO":
            if target_detected:
                steering = 90 + int(error_x * Kp)
                steering = max(45, min(135, steering))
                throttle = stop_throttle if box_width > 200 else base_throttle
        else:
            throttle = manual_throttle
            steering = manual_steering

        command = f"<{throttle},{steering}>\n"
        ser.write(command.encode('utf-8'))
        
        time.sleep(0.05)

if __name__ == '__main__':
    threading.Thread(target=buoy_core_loop, daemon=True).start()
    threading.Thread(target=serial_read_loop, daemon=True).start()
    app.run(host='0.0.0.0', port=5000, threaded=True)