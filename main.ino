#include "servo_cam.h"
#include "thruster.h"
#include "imu.h"
#include "gps.h"

unsigned long lastTelemetryTime = 0;

void setup()
{
    Serial.begin(115200);

    servo_init();
    thruster_init();
    imu_init();
    gps_init();
}

void loop()
{
    // 센서 데이터 최신화
    imu_update();
    gps_update();

    // 파이썬으로부터 명령 수신 및 모터 구동
    control_all();

    if (millis() - lastTelemetryTime > 100)
    {
        lastTelemetryTime = millis();
        
        float lat = gps_get_lat();
        float lon = gps_get_lng();
        float yaw = imu_get_yaw();

        // 파이썬이 읽기 좋게 <위도,경도,방위각> 형태로 전송
        Serial.print("<");
        Serial.print(lat, 6); Serial.print(",");
        Serial.print(lon, 6); Serial.print(",");
        Serial.print(yaw, 2); Serial.println(">");
    }
}

void control_all()
{
    if (Serial.available())
    {
        String packet = Serial.readStringUntil('\n');
        packet.trim();

        // 패킷 형태 검증: <servo, thrL, thrR>
        if (packet.startsWith("<") && packet.endsWith(">"))
        {
            int servoAngle, thrL, thrR;
            
            if (sscanf(packet.c_str(), "<%d,%d,%d>", &servoAngle, &thrL, &thrR) == 3)
            {
                servo_set(servoAngle);
                thruster_set(thrL, thrR);
            }
        }
    }
}