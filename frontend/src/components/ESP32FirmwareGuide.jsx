import React, { useState } from 'react';
import { Code2, Copy, Check, Cpu, Share2, Layers } from 'lucide-react';

export default function ESP32FirmwareGuide() {
  const [copied, setCopied] = useState(false);

  const arduinoCode = `/*
  ================================================================================
  VOLTSAFE IOT - LITHIUM-ION BATTERY SAFETY MONITORING FIRMWARE
  Real-Time Environmental Telemetry & Automated Safety Response
  ================================================================================
  Hardware:
  - ESP32 Development Board (NodeMCU / WROOM-32)
  - NTC 10k Thermistor (Analog Pin 34)
  - MQ-2 Combustible Gas Sensor (Analog Pin 35)
  - 16x2 I2C LCD (SDA: GPIO 21, SCL: GPIO 22, Address: 0x27)
  - Relay Module for Cooling Fan (GPIO 26)
  - Active Piezo Buzzer (GPIO 27)
  ================================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <math.h>

// Wi-Fi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server Ingestion Endpoint (Node.js / Express backend or ThingSpeak)
const char* serverUrl = "http://YOUR_SERVER_IP:5000/api/telemetry";

// Pin Configuration
#define THERMISTOR_PIN 34
#define MQ2_PIN        35
#define RELAY_FAN_PIN  26
#define BUZZER_PIN     27

// LCD 16x2 I2C Initialization
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Steinhart-Hart NTC Parameters
const float SERIES_RESISTOR = 10000.0;
const float NOMINAL_RESISTANCE = 10000.0;
const float NOMINAL_TEMPERATURE = 25.0;
const float B_COEFFICIENT = 3950.0;

float readTemperature() {
  int rawADC = analogRead(THERMISTOR_PIN);
  if (rawADC == 0) return 25.0;
  float resistance = SERIES_RESISTOR / ((4095.0 / (float)rawADC) - 1.0);
  float steinhart;
  steinhart = resistance / NOMINAL_RESISTANCE;
  steinhart = log(steinhart);
  steinhart /= B_COEFFICIENT;
  steinhart += 1.0 / (NOMINAL_TEMPERATURE + 273.15);
  steinhart = 1.0 / steinhart;
  steinhart -= 273.15; // Convert to Celsius
  return steinhart;
}

float readMQ2Gas() {
  int rawADC = analogRead(MQ2_PIN);
  // MQ-2 calibration curve approximation to ppm
  float sensorVolt = ((float)rawADC / 4095.0) * 3.3;
  float gasPpm = (sensorVolt / 3.3) * 1000.0;
  if (gasPpm < 180.0) gasPpm = 180.0;
  return gasPpm;
}

void setup() {
  Serial.begin(115200);
  
  pinMode(RELAY_FAN_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(RELAY_FAN_PIN, LOW); // Relay open
  digitalWrite(BUZZER_PIN, LOW);

  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("BATT SAFEGUARD");
  lcd.setCursor(0, 1);
  lcd.print("CONNECTING WIFI");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\\nWiFi Connected!");
  lcd.clear();
  lcd.print("SYSTEM READY");
  delay(1000);
}

void loop() {
  float temp = readTemperature();
  float gasPpm = readMQ2Gas();

  // Update local 16x2 LCD
  lcd.setCursor(0, 0);
  lcd.printf("T:%.1fC G:%.0fP", temp, gasPpm);

  // Send JSON payload to Backend
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{\\"deviceId\\":\\"ESP32-BATT-01\\",\\"temperature\\":" + 
                         String(temp, 2) + ",\\"gasPpm\\":" + String(gasPpm, 1) + "}";

    int httpCode = http.POST(jsonPayload);
    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);

      // Simple parsing of response decision
      if (response.indexOf("ABNORMAL") > 0) {
        digitalWrite(RELAY_FAN_PIN, HIGH); // Cooling fan ON
        digitalWrite(BUZZER_PIN, HIGH);    // Buzzer ON
        lcd.setCursor(0, 1);
        lcd.print("ALERT: COOLING ON");
      } else {
        digitalWrite(RELAY_FAN_PIN, LOW);  // Cooling fan OFF
        digitalWrite(BUZZER_PIN, LOW);     // Buzzer OFF
        lcd.setCursor(0, 1);
        lcd.print("STATUS: NORMAL   ");
      }
    }
    http.end();
  }

  delay(3000); // 3-second telemetry interval
}
`;

  const copyCode = () => {
    navigator.clipboard.writeText(arduinoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Schematic Overview */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-base font-heading font-bold text-slate-100 flex items-center space-x-2 mb-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <span>Hardware Architecture & Pinout Diagram</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Wiring layout for ESP32 microcontroller, NTC Thermistor, MQ-2 Gas Sensor, 16x2 LCD, Buzzer, and Relay
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">NTC Thermistor</span>
            <div className="text-slate-400 space-y-1 text-[11px]">
              <div>Signal Pin: <b className="text-slate-200">GPIO 34 (ADC1_CH6)</b></div>
              <div>Resistor: <b className="text-slate-200">10kΩ Pull-down</b></div>
              <div>Supply: <b className="text-slate-200">3.3V VCC & GND</b></div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">MQ-2 Gas Sensor</span>
            <div className="text-slate-400 space-y-1 text-[11px]">
              <div>Analog A0: <b className="text-slate-200">GPIO 35 (ADC1_CH7)</b></div>
              <div>Warmup: <b className="text-slate-200">20-30 seconds</b></div>
              <div>Supply: <b className="text-slate-200">5.0V VCC & GND</b></div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-bold block mb-1">Relay & Cooling Fan</span>
            <div className="text-slate-400 space-y-1 text-[11px]">
              <div>Relay IN: <b className="text-slate-200">GPIO 26 (Digital OUT)</b></div>
              <div>Fan Power: <b className="text-slate-200">12V DC External</b></div>
              <div>Speed: <b className="text-slate-200">2800 RPM Active</b></div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-rose-400 font-bold block mb-1">16x2 LCD & Buzzer</span>
            <div className="text-slate-400 space-y-1 text-[11px]">
              <div>LCD I2C: <b className="text-slate-200">SDA 21 | SCL 22</b></div>
              <div>Buzzer Pin: <b className="text-slate-200">GPIO 27</b></div>
              <div>Address: <b className="text-slate-200">0x27 (PCF8574)</b></div>
            </div>
          </div>
        </div>
      </div>

      {/* Arduino C++ Firmware Code */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-heading font-bold text-slate-100 flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-emerald-400" />
              <span>ESP32 Arduino C++ Firmware Source Code</span>
            </h3>
            <p className="text-xs text-slate-400">
              Compile with Arduino IDE 2.x and upload directly to ESP32 board
            </p>
          </div>

          <button
            onClick={copyCode}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Sketch'}</span>
          </button>
        </div>

        <div className="relative">
          <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto max-h-[480px] border border-slate-800 selection:bg-emerald-500 selection:text-black">
            <code>{arduinoCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
