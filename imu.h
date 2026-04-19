#ifndef IMU_H
#define IMU_H

void imu_init();
void imu_update();
float imu_get_yaw();
float imu_get_pitch();
float imu_get_roll();

#endif