const minTempWarn = document.querySelector('input[name="min-temp-warn"]');
const minHumWarn = document.querySelector('input[name="min-hum-warn"]');
const minHumWatering = document.querySelector('input[name="min-hum-watering"]');

const btnMinTempWarn = document.querySelector('#btn-temp-warn');
const btnMinHumWarn = document.querySelector('#btn-hum-warn');
const btnMinHumWatering = document.querySelector('#btn-hum-watering');

btnMinTempWarn.addEventListener('click', async () => {
  const value = minTempWarn.value;
  await fetch(`http://192.168.10.142/min-temp-warn?value=${value}`, {
    method: 'POST',
  });
});

btnMinHumWarn.addEventListener('click', async () => {
  const value = minHumWarn.value;
  await fetch(`http://192.168.10.142/min-hum-warn?value=${value}`, {
    method: 'POST',
  });
});

btnMinHumWatering.addEventListener('click', async () => {
  const value = minHumWatering.value;
  await fetch(`http://192.168.10.142/min-hum-watering?value=${value}`, {
    method: 'POST',
  });
});

minTempWarn.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    btnMinTempWarn.click();
  }
});

minHumWarn.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    btnMinHumWarn.click();
  }
});

minHumWatering.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    btnMinHumWatering.click();
  }
});
