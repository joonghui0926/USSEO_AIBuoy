#include <Arduino.h>
#include <Wire.h>
#include <SparkFun_BNO080_Arduino_Library.h>
#include "imu.h"

BNO080 imu;

float yaw = 0;
float pitch = 0;
float roll = 0;

void imu_init()
{
    Wire.begin();
    if (imu.begin() == false)
    {
        while (1);
    }
    imu.enableRotationVector(50);
}

// 기존 imu_test()를 대체하여 조용히 변수만 갱신
void imu_update()
{
    if (imu.dataAvailable())
    {
        yaw = imu.getYaw();
        pitch = imu.getPitch();
        roll = imu.getRoll();
    }
}

float imu_get_yaw()
{
    return yaw * 180.0 / PI;
}

float imu_get_pitch()
{
    return pitch * 180.0 / PI;
}

float imu_get_roll()
{
    return roll * 180.0 / PI;
}