const stream = document.querySelector('#stream');
const kind = document.querySelector('select[name="kind"]');
const result = document.querySelector('#result');

let model, maxPredictions;

async function loadModel() {
    const modelUrl = 'https://teachablemachine.withgoogle.com/models/XHqAtmRxi';
    const modelJsonUrl = `${modelUrl}/model.json`;
    const modelMetadataUrl = `${modelUrl}/metadata.json`;

    if (kind.value == 'image') {
        model = await tmImage.load(modelJsonUrl, modelMetadataUrl);
    } else if (kind.value == 'pose') {
        model = await tmPose.load(modelJsonUrl, modelMetadataUrl);
    }

    maxPredictions = model.getTotalClasses();
}

async function predict() {
    if (!model) return;

    let resultElement = '';
    let maxClassName = '';
    let maxProbability = '';
    let prediction;

    if (kind.value == 'image') prediction = await model.predict(stream);
    if (kind.value == 'pose') {
        const { pose, posenetOutput } = await model.estimatePose(stream);
        prediction = await Model.predict(posenetOutput);
    }

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
            resultElement += `<p>${prediction[i].className}: ${prediction[i].probability.toFixed(2)}</p>`;
        }
        resultElement += `<b>Result: ${maxClassName}: ${maxProbability.toFixed(2)}</b>`;
        result.innerHTML = resultElement;
    } else result.innerHTML = 'Unrecognizable';
}

async function loadImage() {
    while (true) {
        await predict();
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
}

async function init() {
    window.addEventListener('load', function () {
        stream.src = 'http://192.168.10.113/stream';
    });

    await loadModel();
    loadImage();
}

init();
