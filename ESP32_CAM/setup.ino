void setupWifi() {
  WiFi.begin(ssid, password);
  Serial.println("");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  if (MDNS.begin("esp32")) {
    Serial.println("MDNS responder started");
  }
}

void setupLittleFS() {
  if (!LittleFS.begin()) {
    Serial.println("An Error has occurred while mounting LittleFS");
    return;
  }

  File root = LittleFS.open("/");
  if (!root) {
    Serial.println("Failed to open root directory");
    return;
  }

  if (!root.isDirectory()) {
    Serial.println("Root is not a directory");
    return;
  }

  File file = root.openNextFile();
  Serial.println("READING ROOT..");
  while (file) {
    Serial.printf("%s: %d bytes\n", file.name(), file.size());
    file = root.openNextFile();
  }
}