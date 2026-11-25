// SPDX-License-Identifier: Apache-2.0
/**
 * PocketGull NeuroStim Studio — Benchtop Resistor Phantom BLE GATT Firmware
 * Target: Arduino UNO R4 WiFi / UNO Q (ArduinoBLE) or ESP32-S3
 *
 * SAFETY NOTE: This firmware is strictly a NON-WEARABLE benchtop resistor-network
 * telemetry emulator. It reads an analog 10 kOhm potentiometer on pin A0 to emulate
 * dummy load impedance (Z) and streams IEEE P2933 TIPPSS GATT notifications (`Z=...,SQI=...,TAR=...`)
 * to the Pixel 9 Pro app.
 */

#include <ArduinoBLE.h>

BLEService tippssService("00002933-0000-1000-8000-00805f9b34fb");
BLEStringCharacteristic telemetryChar(
    "00002934-0000-1000-8000-00805f9b34fb",
    BLERead | BLENotify,
    48
);

unsigned long lastNotifyMs = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);

  if (!BLE.begin()) {
    Serial.println("ERR: Failed to initialize BLE module.");
    while (1) {
      delay(1000);
    }
  }

  BLE.setLocalName("PocketGull-Phantom-Rig");
  BLE.setAdvertisedService(tippssService);
  tippssService.addCharacteristic(telemetryChar);
  BLE.addService(tippssService);

  telemetryChar.writeValue("Z=4.80,SQI=97.2,TAR=1.40");
  BLE.advertise();
  Serial.println("PocketGull Benchtop Phantom BLE GATT Advertising (UUID 0x2933)...");
}

void loop() {
  BLEDevice central = BLE.central();
  if (central) {
    digitalWrite(LED_BUILTIN, HIGH);
    while (central.connected()) {
      unsigned long now = millis();
      if (now - lastNotifyMs >= 500) {
        lastNotifyMs = now;

        // Read passive benchtop potentiometer on A0 (0..1023) -> map to 1.2 .. 16.5 kOhm
        int adc = analogRead(A0);
        float zKOhm = 1.20f + (adc / 1023.0f) * 15.30f;
        float sqiPct = (zKOhm <= 12.0f) ? 97.5f : 78.0f;
        float thetaAlphaRatio = 1.35f + ((now % 1000) / 5000.0f);

        char payload[48];
        snprintf(
            payload,
            sizeof(payload),
            "Z=%.2f,SQI=%.1f,TAR=%.2f",
            zKOhm,
            sqiPct,
            thetaAlphaRatio
        );
        telemetryChar.writeValue(payload);
      }
    }
    digitalWrite(LED_BUILTIN, LOW);
  }
}
