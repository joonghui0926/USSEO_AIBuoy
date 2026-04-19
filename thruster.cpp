#include <Arduino.h>
#include <Servo.h>
#include "thruster.h"

#define THRUSTER_L_PIN 6
#define THRUSTER_R_PIN 7
#define THRUSTER_STOP 1500

Servo thrusterL;
Servo thrusterR;

void thruster_init()
{
    thrusterL.attach(THRUSTER_L_PIN, 1000, 2500);
    thrusterR.attach(THRUSTER_R_PIN, 1000, 2500);
    delay(3000); 
    thrusterL.writeMicroseconds(THRUSTER_STOP);
    thrusterR.writeMicroseconds(THRUSTER_STOP);
}

void thruster_stop()
{
    thrusterL.writeMicroseconds(THRUSTER_STOP);
    thrusterR.writeMicroseconds(THRUSTER_STOP);
}

void thruster_set(int left, int right)
{
    // 파이썬에서 0이 넘어오면 1500(정지)으로 변환
    if (left == 0) left = THRUSTER_STOP;
    if (right == 0) right = THRUSTER_STOP;

    if (left >= 1000 && left <= 2000) {
        thrusterL.writeMicroseconds(left);
    }
    if (right >= 1000 && right <= 2000) {
        thrusterR.writeMicroseconds(right);
    }
}