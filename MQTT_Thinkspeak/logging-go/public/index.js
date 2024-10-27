const minTempWarnInput = document.querySelector('input[name="min-temp-warn"]');
const minHumWarnInput = document.querySelector('input[name="min-hum-warn"]');

const enableWateringInput = document.querySelector(
  'input[name="enable-watering"]',
);
const minTempWateringInput = document.querySelector(
  'input[name="min-temp-watering"]',
);
const minHumWateringInput = document.querySelector(
  'input[name="min-hum-watering"]',
);

const btnMinTempWarn = document.querySelector("#btn-temp-warn");
const btnMinHumWarn = document.querySelector("#btn-hum-warn");
const btnWatering = document.querySelector("#btn-watering");

const wateringSettingsDiv = document.querySelector("#watering-div");

const successAlert = document.querySelector("#success");
const failedAlert = document.querySelector("#failed");

const esp8266Url = "http://192.168.10.143";

const hideAlert = () => {
  successAlert.style.display = "none";
  failedAlert.style.display = "none";
};

const showAlert = (alert) => {
  alert.style.display = "block";
  setTimeout(() => {
    alert.style.display = "none";
  }, 3000);
};

document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch(`${esp8266Url}/settings`);
  const settings = await res.json();

  minTempWarnInput.value = settings.minTempWarn;
  minHumWarnInput.value = settings.minHumWarn;
  enableWateringInput.checked = settings.enableWatering;
  minTempWateringInput.value = settings.minTempWatering;
  minHumWateringInput.value = settings.minHumWatering;

  wateringSettingsDiv.style.display = enableWateringInput.checked
    ? "block"
    : "none";
});

btnMinTempWarn.addEventListener("click", async () => {
  hideAlert();
  const value = minTempWarnInput.value;

  try {
    await fetch(`${esp8266Url}/settings/min-temp-warn?value=${value}`, {
      method: "POST",
    });
  } catch (err) {
    console.log(err);
    showAlert(failedAlert);
  }
  showAlert(successAlert);
});

btnMinHumWarn.addEventListener("click", async () => {
  hideAlert();
  const value = minHumWarnInput.value;

  try {
    await fetch(`${esp8266Url}/settings/min-hum-warn?value=${value}`, {
      method: "POST",
    });
  } catch (err) {
    console.log(err);
    showAlert(failedAlert);
  }
  showAlert(successAlert);
});

enableWateringInput.addEventListener("change", () => {
  wateringSettingsDiv.style.display = enableWateringInput.checked
    ? "block"
    : "none";
});

btnWatering.addEventListener("click", async () => {
  hideAlert();

  const enableWatering = enableWateringInput.checked;
  const minTempWatering = minTempWateringInput.value;
  const minHumWatering = minHumWateringInput.value;

  try {
    await fetch(
      `${esp8266Url}/settings/watering?enableWatering=${enableWatering}&minTempWatering=${minTempWatering}&minHumWatering=${minHumWatering}`,
      {
        method: "POST",
      },
    );
  } catch (err) {
    console.log(err);
    showAlert(failedAlert);
  }
  showAlert(successAlert);
});

minTempWarnInput.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    btnMinTempWarn.click();
  }
});

minHumWarnInput.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    btnMinHumWarn.click();
  }
});
