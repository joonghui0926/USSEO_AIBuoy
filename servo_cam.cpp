#include <Arduino.h>
#include <Servo.h>
#include "servo_cam.h"

#define SERVO_PIN 5
#define SERVO_FRONT 96

Servo camServo;

void servo_init()
{
    camServo.attach(SERVO_PIN);
    camServo.write(SERVO_FRONT);
}

void servo_stop()
{
    camServo.write(SERVO_FRONT);
}

int convert_angle(int angle)
{
    if (angle > 160) angle = 160;
    if (angle < -160) angle = -160;
    
    // -160~160 범위를 서보모터 스펙에 맞게 변환
    int value = 96 - (angle * (84.0 / 160.0));
    return value;
}

void servo_set(int angle)
{
    int servo_angle = convert_angle(angle);
    camServo.write(servo_angle);
}