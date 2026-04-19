"""
/************************************************************************************************
 * Organization  : LognCoding
 * Project       : AI Rescue Buoy
 * Created       : 2026-03-29
 * Author        : Joonghui Cho
 *
 * System        : Raspberry Pi 5
 *
 * Description:
 * low latency video streaming optimized for Raspberry Pi 5.
 * Separated Camera I/O thread, AI Inference thread, and Web Streaming thread
 * to completely eliminate buffer queue delay.
************************************************************************************************/
"""
import cv2
import serial
import time
import threading
import glob
import queue
import tempfile
import os
import socket
from collections import deque
from flask import Flask, Response
from flask_cors import CORS
from ultralytics import YOLO
import firebase_admin
from firebase_admin import credentials, firestore
import speech_recognition as sr
import pygame
from gtts import gTTS

app = Flask(__name__)
CORS(app)

# 1. Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# 2. 아두이노 시리얼 포트 자동 찾기
def find_arduino_port():
    ports = glob.glob('/dev/ttyUSB*') + glob.glob('/dev/ttyACM*')
    if ports:
        print(f"[SYSTEM] Arduino connected at: {ports[0]}")
        return ports[0]
    print("[ERROR] Arduino not found! Defaulting to /dev/ttyUSB0")
    return '/dev/ttyUSB0'

ser = serial.Serial(find_arduino_port(), 115200, timeout=1)

# 스레드 락 및 전역 상태
latest_frame = None
display_frame = None
frame_lock = threading.Lock()
serial_lock = threading.Lock()
control_mode = "AUTO"
manual_direction = "STOP"
mic_on = False
speaker_on = False
tts_queue = queue.Queue()

pygame.mixer.init()

# 3. [최적화] 카메라 전용 로드 함수
def get_working_camera():
    for i in range(10):
        # V4L2 백엔드
        cap = cv2.VideoCapture(i, cv2.CAP_V4L2) 
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                print(f"[SYSTEM] Camera successfully loaded at port {i}")
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1) 
                return cap
        cap.release()
    raise Exception("[ERROR] No working camera found.")

cap = get_working_camera()
model = YOLO("yolov8n.pt")

# Firebase Firestore 리스너
fs_db = firestore.client()

# Pi IP 자동 감지 → Firestore 등록
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

local_ip = get_local_ip()
fs_db.collection('buoys').document('buoy_01').set({'system': {'ip': local_ip}}, merge=True)
print(f"[SYSTEM] Registered IP: {local_ip}")

def db_listener(doc_snapshots, _changes, _read_time):
    global control_mode, manual_direction, mic_on, speaker_on
    for snap in doc_snapshots:
        data = snap.to_dict()
        if data:
            control_mode = data.get("mode", "AUTO")
            manual_direction = data.get("direction", "STOP")
            mic_on = bool(data.get("mic", 0))
            speaker_on = bool(data.get("speaker", 0))
            tts_text = data.get("tts_text", "")
            if tts_text:
                tts_queue.put(tts_text)
                fs_db.collection('buoys').document('buoy_01_control').update({"tts_text": ""})

fs_db.collection('buoys').document('buoy_01_control').on_snapshot(db_listener)

# 8. 마이크 → 음성인식 → Firestore
def speech_recognition_loop():
    recognizer = sr.Recognizer()
    recognizer.energy_threshold = 300
    recognizer.dynamic_energy_threshold = True
    buoy_doc = fs_db.collection('buoys').document('buoy_01')

    while True:
        if not mic_on:
            time.sleep(0.5)
            continue
        try:
            with sr.Microphone() as source:
                recognizer.adjust_for_ambient_noise(source, duration=0.3)
                audio = recognizer.listen(source, timeout=5, phrase_time_limit=8)
            text = recognizer.recognize_google(audio, language='ko-KR')
            print(f"[MIC] Recognized: {text}")
            buoy_doc.set({"speech": {"person_transcript": text}}, merge=True)
        except sr.WaitTimeoutError:
            pass
        except sr.UnknownValueError:
            pass
        except Exception as e:
            print(f"[MIC] Error: {e}")
            time.sleep(1)

# 9. Firestore tts_text → gTTS → 스피커 재생
def tts_loop():
    while True:
        try:
            text = tts_queue.get(timeout=1)
            if not text:
                continue
            print(f"[TTS] Speaking: {text}")
            tts = gTTS(text=text, lang='ko')
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as f:
                tmp_path = f.name
            tts.save(tmp_path)
            pygame.mixer.music.load(tmp_path)
            pygame.mixer.music.play()
            while pygame.mixer.music.get_busy():
                time.sleep(0.1)
            os.unlink(tmp_path)
        except queue.Empty:
            pass
        except Exception as e:
            print(f"[TTS] Error: {e}")
            time.sleep(1)

# 4. [최적화 스레드 1] 카메라 프레임 캡처
def camera_capture_loop():
    global latest_frame
    while True:
        ret, frame = cap.read()
        if ret:
            with frame_lock:
                latest_frame = frame

# 5. [최적화 스레드 2] AI 분석 및 로봇 제어
def ai_control_loop():
    global latest_frame, display_frame, control_mode, manual_direction
    
    FRAME_CENTER_X = 320
    BASE_PWM = 1400  
    STOP_PWM = 1500  
    
    servo_angle = 0
    detection_history = deque(maxlen=30)

    while True:
        # 가장 최신 프레임만
        with frame_lock:
            if latest_frame is None:
                continue
            frame_to_process = latest_frame.copy()

        # YOLO AI 추론
        results = model(frame_to_process, stream=True, verbose=False)
        target_detected = False
        error_x = 0

        for r in results:
            for box in r.boxes:
                if int(box.cls[0]) == 0:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    center_x = (x1 + x2) // 2
                    cv2.rectangle(frame_to_process, (x1, y1), (x2, y2), (0, 0, 255), 2)
                    error_x = center_x - FRAME_CENTER_X
                    target_detected = True
                    break
            if target_detected: break

        with frame_lock:
            display_frame = frame_to_process

        detection_history.append(target_detected)
        detection_ratio = sum(detection_history) / len(detection_history) if detection_history else 0
        is_stable_detection = detection_ratio >= 0.33

        thrL, thrR = STOP_PWM, STOP_PWM

        if control_mode == "AUTO":
            if is_stable_detection:
                servo_angle += (error_x * 0.05)
                servo_angle = max(-160, min(160, servo_angle))
                
                if servo_angle < -20:    
                    thrL = STOP_PWM      
                    thrR = BASE_PWM      
                elif servo_angle > 20:   
                    thrL = BASE_PWM      
                    thrR = STOP_PWM      
                else:                    
                    thrL = BASE_PWM      
                    thrR = BASE_PWM
            else:
                thrL, thrR = STOP_PWM, STOP_PWM

        elif control_mode == "MANUAL":
            if manual_direction == "UP":
                thrL, thrR = BASE_PWM, BASE_PWM
            elif manual_direction == "DOWN":
                thrL, thrR = 1600, 1600
            elif manual_direction == "LEFT":
                thrL, thrR = 1600, 1400 
            elif manual_direction == "RIGHT":
                thrL, thrR = 1400, 1600 
            else: 
                thrL, thrR = STOP_PWM, STOP_PWM
            servo_angle = 0 

        command = f"<{int(servo_angle)},{thrL},{thrR}>\n"
        with serial_lock:
            ser.write(command.encode('utf-8'))
        
        time.sleep(0.05)

# 6. [최적화 스레드 3] 웹 송출 제너레이터
def generate_frames():
    global display_frame
    while True:
        with frame_lock:
            if display_frame is None:
                continue
            current = display_frame.copy()
            
        ret, buffer = cv2.imencode('.jpg', current)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.03)

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# 7. 아두이노 텔레메트리 수신 → Firestore 업로드
def telemetry_loop():
    buoy_doc = fs_db.collection('buoys').document('buoy_01')
    buffer = ""
    while True:
        try:
            with serial_lock:
                if ser.in_waiting:
                    buffer += ser.read(ser.in_waiting).decode('utf-8', errors='ignore')

            while '<' in buffer and '>' in buffer:
                start = buffer.index('<')
                end = buffer.index('>')
                packet = buffer[start+1:end]
                buffer = buffer[end+1:]

                parts = packet.split(',')
                if len(parts) == 3:
                    lat, lon, yaw = float(parts[0]), float(parts[1]), float(parts[2])
                    buoy_doc.set({
                        'telemetry': {
                            'latitude': lat,
                            'longitude': lon,
                            'heading': yaw,
                            'speed': 0
                        }
                    }, merge=True)
        except Exception as e:
            print(f"[TELEMETRY] Error: {e}")
        time.sleep(0.1)

if __name__ == '__main__':
    threading.Thread(target=camera_capture_loop, daemon=True).start()
    threading.Thread(target=ai_control_loop, daemon=True).start()
    threading.Thread(target=telemetry_loop, daemon=True).start()
    threading.Thread(target=speech_recognition_loop, daemon=True).start()
    threading.Thread(target=tts_loop, daemon=True).start()

    app.run(host='0.0.0.0', port=5000, threaded=True)