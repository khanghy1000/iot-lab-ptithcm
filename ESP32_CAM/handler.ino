void handleJpgStream(void) {
  WiFiClient client = server.client();
  String response = "HTTP/1.1 200 OK\r\n";
  response += "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n\r\n";
  server.sendContent(response);

  while (1) {
    cam.run();
    if (!client.connected())
      break;
    response = "--frame\r\n";
    response += "Content-Type: image/jpeg\r\n\r\n";
    server.sendContent(response);

    client.write((char *)cam.getfb(), cam.getSize());
    server.sendContent("\r\n");
    if (!client.connected())
      break;
  }
}

void handleJpg(void) {
  WiFiClient client = server.client();

  cam.run();
  if (!client.connected()) {
    return;
  }
  String response = "HTTP/1.1 200 OK\r\n";
  response += "Content-disposition: inline; filename=capture.jpg\r\n";
  response += "Content-type: image/jpeg\r\n\r\n";
  server.sendContent(response);
  client.write((char *)cam.getfb(), cam.getSize());
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

void handleResolution() {
  sensor_t *s = esp_camera_sensor_get();
  String value = server.arg("value");

  bool success = true;

  if (value == "QQVGA") {
    s->set_framesize(s, FRAMESIZE_QQVGA);
  } else if (value == "HQVGA") {
    s->set_framesize(s, FRAMESIZE_HQVGA);
  } else if (value == "QVGA") {
    s->set_framesize(s, FRAMESIZE_QVGA);
  } else if (value == "CIF") {
    s->set_framesize(s, FRAMESIZE_CIF);
  } else if (value == "VGA") {
    s->set_framesize(s, FRAMESIZE_VGA);
  } else if (value == "SVGA") {
    s->set_framesize(s, FRAMESIZE_SVGA);
  } else if (value == "XGA") {
    s->set_framesize(s, FRAMESIZE_XGA);
  } else if (value == "SXGA") {
    s->set_framesize(s, FRAMESIZE_SXGA);
  } else if (value == "UXGA") {
    s->set_framesize(s, FRAMESIZE_UXGA);
  } else {
    success = false;
  }

  if (success) {
    server.send(200, "text/plain", "Success");
    return;
  }

  server.send(400, "text/plain", "Bad Request");
}

void handleFlash() {
  String value = server.arg("value");
  analogWrite(led, value.toInt());
  server.send(200, "text/plain", "Success");
}

void handleQuality() {
  sensor_t *s = esp_camera_sensor_get();
  String value = server.arg("value");
  s->set_quality(s, value.toInt());
  server.send(200, "text/plain", "Success");
}

void handleBrightness() {
  sensor_t *s = esp_camera_sensor_get();
  String value = server.arg("value");
  s->set_brightness(s, value.toInt());
  server.send(200, "text/plain", "Success");
}

void handleContrast() {
  sensor_t *s = esp_camera_sensor_get();
  String value = server.arg("value");
  s->set_contrast(s, value.toInt());
  server.send(200, "text/plain", "Success");
}

void handleMirror() {
  sensor_t *s = esp_camera_sensor_get();
  String value = server.arg("value");

  int mirror = 0;
  if (value == "true") mirror = 1;

  s->set_hmirror(s, mirror);
  server.send(200, "text/plain", "Success");
}

void handleFlip() {
  sensor_t *s = esp_camera_sensor_get();
  String value = server.arg("value");

  int flip = 0;
  if (value == "false") flip = 1;

  s->set_vflip(s, flip);
  server.send(200, "text/plain", "Success");
}
