const stream = document.querySelector("#stream");
const result = document.querySelector("#result");

const resolution = document.querySelector('select[name="resolution"]');
const flash = document.querySelector('input[name="flash"]');
const quality = document.querySelector('input[name="quality"]');
const brightness = document.querySelector('input[name="brightness"]');
const contrast = document.querySelector('input[name="contrast"]');
const hMirror = document.querySelector('input[name="h-mirror"]');
const vFlip = document.querySelector('input[name="v-flip"]');

const btnGetStill = document.querySelector("#btn-get-still");
const btnReset = document.querySelector("#btn-reset");

async function loadImage(elem) {
  return new Promise((resolve, reject) => {
    elem.onload = () => resolve(elem);
    elem.onerror = reject;
  });
}

let model, maxPredictions;

async function loadModel() {
  const modelUrl = "https://teachablemachine.withgoogle.com/models/2J0I_M5x8";
  const modelJsonUrl = `${modelUrl}/model.json`;
  const modelMetadataUrl = `${modelUrl}/metadata.json`;

  model = await tmImage.load(modelJsonUrl, modelMetadataUrl);
  maxPredictions = model.getTotalClasses();
}

let predictionResult = "";

async function predict() {
  if (!model) return;

  let resultElement = "";
  let maxClassName = "";
  let maxProbability = 0;
  let prediction;

  prediction = await model.predict(stream);

  if (maxPredictions > 0) {
    for (let i = 0; i < maxPredictions; i++) {
      if (i == 0) {
        maxClassName = prediction[i].className;
        maxProbability = prediction[i].probability;
      } else {
        if (prediction[i].probability > maxProbability) {
          maxClassName = prediction[i].className;
          maxProbability = prediction[i].probability;
        }
      }
      resultElement += `
        <p>
            <span class="text-blue">${prediction[i].className}: </span>
            <span>${prediction[i].probability.toFixed(2)} </span>
            <progress value="${prediction[i].probability.toFixed(2) * 100}" max="100" />
        </p>`;
    }
    resultElement += `
        <b>
            <span class="text-indigo">Result: </span>
            ${maxClassName} ${maxProbability.toFixed(2)}
        </b>`;

    result.innerHTML = resultElement;
    predictionResult = maxClassName;
    return;
  }
  result.innerHTML = "Unrecognizable";
  predictionResult = "Unrecognizable";
}

async function predictLoop() {
  while (true) {
    await predict();
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

btnGetStill.addEventListener("click", async function () {
  stream.removeAttribute("src");
  stream.src = "/jpg?time=" + new Date().getTime();
  await loadImage(stream);
  await predict();
  await fetch(`/telegram?value=${predictionResult}`, {
    method: "POST",
  });
});

btnReset.addEventListener("click", function () {
  stream.src = "/stream";
});

resolution.addEventListener("change", async () => {
  // Disconnect the stream because Arduino ESP32's Web Server library
  // can only handle one connection at a time.
  stream.removeAttribute("src");
  try {
    await fetch(`/resolution?value=${resolution.value}`, {
      method: "POST",
    });
  } catch (err) {
    console.log(err);
  } finally {
    stream.src = "/stream";
  }
});

flash.addEventListener("change", async () => {
  stream.removeAttribute("src");
  try {
    await fetch(`/flash?value=${flash.value}`, {
      method: "POST",
    });
  } catch (err) {
    console.log(err);
  } finally {
    stream.src = "/stream";
  }
});

quality.addEventListener("change", async () => {
  stream.removeAttribute("src");
  try {
    await fetch(`/quality?value=${quality.value}`, {
      method: "POST",
    });
  } catch (err) {
    console.log(err);
  } finally {
    stream.src = "/stream";
  }
});

brightness.addEventListener("change", async () => {
  stream.removeAttribute("src");
  try {
    await fetch(`/brightness?value=${brightness.value}`, {
      method: "POST",
    });
  } catch (err) {
    console.log(err);
  } finally {
    stream.src = "/stream";
  }
});

contrast.addEventListener("change", async () => {
  stream.removeAttribute("src");
  try {
    await fetch(`/contrast?value=${contrast.value}`, {
      method: "POST",
    });
  } catch (err) {
    console.log(err);
  } finally {
    stream.src = "/stream";
  }
});

hMirror.addEventListener("change", async () => {
  stream.removeAttribute("src");
  try {
    await fetch(`/h-mirror?value=${hMirror.checked}`, {
      method: "POST",
    });
  } catch (err) {
    hMirror.checked = !hMirror.checked;
  } finally {
    stream.src = "/stream";
  }
});

vFlip.addEventListener("change", async () => {
  stream.removeAttribute("src");
  try {
    await fetch(`/v-flip?value=${vFlip.checked}`, {
      method: "POST",
    });
  } catch (err) {
    vFlip.checked = !vFlip.checked;
  } finally {
    stream.src = "/stream";
  }
});

window.addEventListener("load", async function () {
  try {
    await fetch(`/resolution?value=${resolution.value}`, {
      method: "POST",
    });
    await fetch(`/flash?value=${flash.value}`, {
      method: "POST",
    });
    await fetch(`/quality?value=${quality.value}`, {
      method: "POST",
    });
    await fetch(`/brightness?value=${brightness.value}`, {
      method: "POST",
    });
    await fetch(`/contrast?value=${contrast.value}`, {
      method: "POST",
    });
    await fetch(`/h-mirror?value=${hMirror.checked}`, {
      method: "POST",
    });
    await fetch(`/v-flip?value=${vFlip.checked}`, {
      method: "POST",
    });
  } catch (err) {
    console.log(err);
  } finally {
    stream.src = "/stream";
  }
});

async function init() {
  await loadModel();
  predictLoop();
}

init();
