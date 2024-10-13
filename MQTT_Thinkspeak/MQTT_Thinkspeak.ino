#include "EspMQTTClient.h"
#include "mqtt_secrets.h"
#include "DHT.h"

EspMQTTClient client(
  SECRET_WIFI_NAME,
  SECRET_WIFI_PASSWORD,
  "mqtt3.thingspeak.com",
  SECRET_MQTT_USERNAME,
  SECRET_MQTT_PASSWORD,
  SECRET_MQTT_CLIENT_ID);

#define DHTPIN D7
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

unsigned long lastTime = 0;
unsigned long delayTime = 20000;

String publishUrl = String("channels/" + String(CHANNEL_ID) + "/publish");

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void onConnectionEstablished() {
  Serial.println("Connected");
}

void loop() {
  client.loop();

  unsigned long currentTime = millis();

  if ((currentTime - lastTime >= delayTime) && client.isConnected()) {
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

    lastTime = currentTime;
  }
}
