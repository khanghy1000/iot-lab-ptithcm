#include <ArduinoJson.h>

void handleGetStats() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(humidity) || isnan(temperature)) {
    server.send(502, "text/plain", "Failed to read from DHT sensor!");
    return;
  }

  JsonDocument result;
  result["temperature"] = temperature;
  result["humidity"] = humidity;

  String serializedResult;
  serializeJson(result, serializedResult);

  server.send(200, "application/json", serializedResult);
}

void handleTempWarn() {
  String value = server.arg("value");
  minTempWarn = value.toFloat();
  server.send(200, "text/plain", "Success");
}

void handleHumWarn() {
  String value = server.arg("value");
  minHumWarn = value.toFloat();
  server.send(200, "text/plain", "Success");
}

void handleHumWatering() {
  String value = server.arg("value");
  minHumWatering = value.toFloat();
  server.send(200, "text/plain", "Success");
}

void handleNotFound() {
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
}