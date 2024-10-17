#include "EspMQTTClient.h"
#include "mqtt_secrets.h"
#include "DHT.h"
#include <ESP8266WebServer.h>
#include <ESP8266WiFi.h>

EspMQTTClient client(
  SECRET_WIFI_NAME,
  SECRET_WIFI_PASSWORD,
  "mqtt3.thingspeak.com",
  SECRET_MQTT_USERNAME,
  SECRET_MQTT_PASSWORD,
  SECRET_MQTT_CLIENT_ID);

WebServer server(80);

#define DHTPIN D7
#define DHTTYPE DHT11
#define BUZZER D6
#define RED_LED D5
#define YELLOW_LED D2
#define GREEN_LED D1

DHT dht(DHTPIN, DHTTYPE);

unsigned long mqttLastTime = 0;
unsigned long mqttDelayTime = 20000;

unsigned long buzzerLastTime = 0;
unsigned long buzzerDelayTime = 1000;
bool buzz = false;

unsigned long redLedLastTime = 0;
unsigned long redLedDelayTime = 1000;
bool redLed = false;

unsigned long greenLedLastTime = 0;
unsigned long greenLedDelayTime = 1000;
bool greenLed = false;

int minTempWarn = 40;

int minHumWatering = 60;
int minHumWarn = 85;

String publishUrl = String("channels/" + String(CHANNEL_ID) + "/publish");

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  dht.begin();
}

void onConnectionEstablished() {
  Serial.println("MQTT connected");

  server.enableCORS(true);
  server.on("/stats", HTTP_GET, handleGetStats);
  server.on("/min-temp-warn", HTTP_POST, handleTempWarn);
  server.on("/min-hum-warn", HTTP_POST, handleHumWarn);
  server.on("/min-hum-watering", HTTP_POST, handleHumWatering);
  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (millis() - buzzerLastTime >= buzzerDelayTime) {
    float temperature = dht.readTemperature();
    if (temperature >= minTempWarn) {
      buzz = !buzz;
    } else {
      buzz = false;
    }

    digitalWrite(BUZZER, buzz ? HIGH : LOW);
    buzzerLastTime = millis();
  }

  if (millis() - redLedLastTime >= redLedDelayTime) {
    float humidity = dht.readHumidity();

    if (humidity >= minHumWarn) {
      redLed = !redLed;
    } else {
      redLed = false;
    }

    digitalWrite(RED_LED, redLed ? HIGH : LOW);
    redLedLastTime = millis();
  }

  if (millis() - greenLedLastTime >= greenLedDelayTime) {
    float humidity = dht.readHumidity();

    if (humidity >= minHumWatering) {
      greenLed = !greenLed;
    } else {
      greenLed = false;
    }

    digitalWrite(GREEN_LED, greenLed ? HIGH : LOW);
    greenLedLastTime = millis();
  }

  server.handleClient();
  client.loop();

  if ((millis() - mqttLastTime >= mqttDelayTime) && client.isConnected()) {
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    String dataText = String("field1=" + String(temperature) + "&field2=" + String(humidity) + "&status=MQTTPUBLISH");
    client.publish(publishUrl, dataText);

    Serial.print("Humidity: ");
    Serial.print(humidity);
    Serial.print(" %\t");
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" *C");

    mqttLastTime = millis();
  }
}
