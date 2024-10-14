const stream = document.querySelector('#stream');
const result = document.querySelector('#result');

// const kind = document.querySelector('select[name="kind"]');
const resolution = document.querySelector('select[name="resolution"]');
const flash = document.querySelector('input[name="flash"]');
const quality = document.querySelector('input[name="quality"]');
const brightness = document.querySelector('input[name="brightness"]');
const contrast = document.querySelector('input[name="contrast"]');
const hMirror = document.querySelector('input[name="h-mirror"]');
const vFlip = document.querySelector('input[name="v-flip"]');

const btnGetStill = document.querySelector('#btn-get-still');
const btnReset = document.querySelector('#btn-reset');

let model, maxPredictions;

async function loadModel() {
    const modelUrl = 'https://teachablemachine.withgoogle.com/models/XHqAtmRxi';
    const modelJsonUrl = `${modelUrl}/model.json`;
    const modelMetadataUrl = `${modelUrl}/metadata.json`;

    // if (kind.value == 'image') {
    //     model = await tmImage.load(modelJsonUrl, modelMetadataUrl);
    // } else if (kind.value == 'pose') {
    //     model = await tmPose.load(modelJsonUrl, modelMetadataUrl);
    // }
    model = await tmImage.load(modelJsonUrl, modelMetadataUrl);

    maxPredictions = model.getTotalClasses();
}

async function predict() {
    if (!model) return;

    let resultElement = '';
    let maxClassName = '';
    let maxProbability = '';
    let prediction;

    // if (kind.value == 'image') prediction = await model.predict(stream);
    // if (kind.value == 'pose') {
    //     const { pose, posenetOutput } = await model.estimatePose(stream);
    //     prediction = await model.predict(posenetOutput);
    // }

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
            resultElement += `<p><span class="text-pink">${prediction[i].className}:</span> ${prediction[i].probability.toFixed(2)}</p>`;
        }
        resultElement += `<b><span class="text-indigo">Result: ${maxClassName}:</span> ${maxProbability.toFixed(2)}</b>`;
        result.innerHTML = resultElement;
    } else result.innerHTML = 'Unrecognizable';
}

async function predictLoop() {
    while (true) {
        await predict();
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
}

btnGetStill.addEventListener('click', function () {
    stream.removeAttribute('src');
    stream.src = '/jpg?time=' + new Date().getTime();
});

btnReset.addEventListener('click', function () {
    stream.src = '/stream';
});

resolution.addEventListener('change', async () => {
    // Disconnect the stream because Arduino ESP32's Web Server library
    // can only handle one connection at a time.
    stream.removeAttribute('src');
    try {
        await fetch(`/resolution?value=${resolution.value}`, {
            method: 'POST',
        });
    } catch (err) {
        console.log(err);
    } finally {
        stream.src = '/stream';
    }
});

flash.addEventListener('change', async () => {
    stream.removeAttribute('src');
    try {
        await fetch(`/flash?value=${flash.value}`, {
            method: 'POST',
        });
    } catch (err) {
        console.log(err);
    } finally {
        stream.src = '/stream';
    }
});

quality.addEventListener('change', async () => {
    stream.removeAttribute('src');
    try {
        await fetch(`/quality?value=${quality.value}`, {
            method: 'POST',
        });
    } catch (err) {
        console.log(err);
    } finally {
        stream.src = '/stream';
    }
});

brightness.addEventListener('change', async () => {
    stream.removeAttribute('src');
    try {
        await fetch(`/brightness?value=${brightness.value}`, {
            method: 'POST',
        });
    } catch (err) {
        console.log(err);
    } finally {
        stream.src = '/stream';
    }
});

contrast.addEventListener('change', async () => {
    stream.removeAttribute('src');
    try {
        await fetch(`/contrast?value=${contrast.value}`, {
            method: 'POST',
        });
    } catch (err) {
        console.log(err);
    } finally {
        stream.src = '/stream';
    }
});

hMirror.addEventListener('change', async () => {
    stream.removeAttribute('src');
    try {
        await fetch(`/h-mirror?value=${hMirror.checked}`, {
            method: 'POST',
        });
    } catch (err) {
        hMirror.checked = !hMirror.checked;
    } finally {
        stream.src = '/stream';
    }
});

vFlip.addEventListener('change', async () => {
    stream.removeAttribute('src');
    try {
        await fetch(`/v-flip?value=${vFlip.checked}`, {
            method: 'POST',
        });
    } catch (err) {
        vFlip.checked = !vFlip.checked;
    } finally {
        stream.src = '/stream';
    }
});

window.addEventListener('load', async function () {
    try {
        await fetch(`/resolution?value=${resolution.value}`, {
            method: 'POST',
        });
        await fetch(`/flash?value=${flash.value}`, {
            method: 'POST',
        });
        await fetch(`/quality?value=${quality.value}`, {
            method: 'POST',
        });
        await fetch(`/brightness?value=${brightness.value}`, {
            method: 'POST',
        });
        await fetch(`/contrast?value=${contrast.value}`, {
            method: 'POST',
        });
        await fetch(`/h-mirror?value=${hMirror.checked}`, {
            method: 'POST',
        });
        await fetch(`/v-flip?value=${vFlip.checked}`, {
            method: 'POST',
        });
    } catch (err) {
        console.log(err);
    } finally {
        stream.src = '/stream';
    }
});

async function init() {
    await loadModel();
    predictLoop();
}

init();
