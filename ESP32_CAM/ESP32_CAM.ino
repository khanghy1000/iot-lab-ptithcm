#include <WiFiClient.h>
#include <WebServer.h>
#include <WiFi.h>
#include <ESPmDNS.h>
#include "LittleFS.h"

#include "Arduino.h"
#include "camera.h"

#include "SimStreamer.h"
#include "OV2640Streamer.h"
#include "CRtspSession.h"

const char* ssid = "Lau3D12";
const char* password = "dungtratien";

WebServer server(80);

const int led = 4;

void setup(void) {
  pinMode(led, OUTPUT);
  digitalWrite(led, 0);
  Serial.begin(115200);

  setupWifi();
  setupCamera();
  setupLittleFS();
  
  server.serveStatic("/", LittleFS, "/index.html");

  server.on("/stream", HTTP_GET, handleJpgStream);
  server.on("/jpg", HTTP_GET, handleJpg);
  server.on("/resolution", HTTP_POST, handleResolution);
  server.on("/flash", HTTP_POST, handleFlash);
  server.on("/quality", HTTP_POST, handleQuality);
  server.on("/brightness", HTTP_POST, handleBrightness);
  server.on("/contrast", HTTP_POST, handleContrast);
  server.on("/h-mirror", HTTP_POST, handleMirror);
  server.on("/v-flip", HTTP_POST, handleFlip);

  server.serveStatic("/", LittleFS, "/");

  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
}

void loop(void) {
  server.handleClient();
}
