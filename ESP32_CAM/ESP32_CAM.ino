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

const int led = 13;

void setup(void) {
  pinMode(led, OUTPUT);
  digitalWrite(led, 0);
  Serial.begin(115200);

  setupWifi();
  setupCamera();
  setupLittleFS();
  
  server.enableCORS();

  server.serveStatic("/", LittleFS, "/index.html");

  server.on("/stream", HTTP_GET, handle_jpg_stream);
  server.on("/jpg", HTTP_GET, handle_jpg);

  server.serveStatic("/", LittleFS, "/");

  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
}

void loop(void) {
  server.handleClient();
}
