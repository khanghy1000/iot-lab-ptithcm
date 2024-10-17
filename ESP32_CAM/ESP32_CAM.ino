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

#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>
#include <ArduinoJson.h>

const char* ssid = "Lau3D12";
const char* password = "dungtratien";

String BOTtoken = "7757201687:AAHOXHP2iEueOgHXS1kAIaCXWPi_tWDZ4w8";
String CHAT_ID = "788184350";

bool sendPhoto = false;

WiFiClientSecure clientTCP;
UniversalTelegramBot bot(BOTtoken, clientTCP);

int botRequestDelay = 1000;
unsigned long lastTimeBotRan;

WebServer server(80);

const int led = 4;

void setup(void) {
  pinMode(led, OUTPUT);
  digitalWrite(led, 0);
  Serial.begin(115200);

  clientTCP.setCACert(TELEGRAM_CERTIFICATE_ROOT);

  setupWifi();
  setupCamera();
  setupLittleFS();

  server.serveStatic("/", LittleFS, "/index.html");

  server.enableCORS(true);
  server.on("/stream", HTTP_GET, handleJpgStream);
  server.on("/jpg", HTTP_GET, handleJpg);
  server.on("/resolution", HTTP_POST, handleResolution);
  server.on("/flash", HTTP_POST, handleFlash);
  server.on("/quality", HTTP_POST, handleQuality);
  server.on("/brightness", HTTP_POST, handleBrightness);
  server.on("/contrast", HTTP_POST, handleContrast);
  server.on("/h-mirror", HTTP_POST, handleMirror);
  server.on("/v-flip", HTTP_POST, handleFlip);
  server.on("/telegram", HTTP_POST, handleTelegramMaskDetection);

  server.serveStatic("/", LittleFS, "/");

  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
}

void loop(void) {
  if (sendPhoto) {
    Serial.println("Preparing photo");
    sendPhotoTelegram();
    sendPhoto = false;
  }
  if (millis() > lastTimeBotRan + botRequestDelay) {
    int numNewMessages = bot.getUpdates(bot.last_message_received + 1);
    while (numNewMessages) {
      Serial.println("got response");
      handleNewMessages(numNewMessages);
      numNewMessages = bot.getUpdates(bot.last_message_received + 1);
    }
    lastTimeBotRan = millis();
  }
  server.handleClient();
}
