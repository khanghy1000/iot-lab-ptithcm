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

void handleGetSettings() {
  JsonDocument result;
  result["minTempWarn"] = minTempWarn;
  result["minHumWarn"] = minHumWarn;
  result["enableWatering"] = enableWatering;
  result["minTempWatering"] = minTempWatering;
  result["minHumWatering"] = minHumWatering;

  String serializedResult;
  serializeJson(result, serializedResult);

  server.send(200, "application/json", serializedResult);
}

void handleSetTempWarn() {
  String value = server.arg("value");
  minTempWarn = value.toFloat();
  Serial.println(String("Set minTempWarn = " + String(minTempWarn)));
  server.send(200, "text/plain", "Success");
}

void handleSetHumWarn() {
  String value = server.arg("value");
  minHumWarn = value.toFloat();
  Serial.println(String("Set minHumWarn = " + String(minHumWarn)));
  server.send(200, "text/plain", "Success");
}

void handleSetWatering() {
  String reqEnableWatering = server.arg("enableWatering");
  String reqMinTempWatering = server.arg("minTempWatering");
  String reqMinHumWatering = server.arg("minHumWatering");

  enableWatering = reqEnableWatering == "true";
  minTempWatering = reqMinTempWatering.toFloat();
  minHumWatering = reqMinHumWatering.toFloat();

  Serial.println(String("Set enableWatering = " + String(enableWatering)));
  Serial.println(String("Set minTempWatering = " + String(minTempWatering)));
  Serial.println(String("Set minHumWatering = " + String(minHumWatering)));
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