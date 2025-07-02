let canvas = document.getElementById
let ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);
canvas.addEventListener('mousemove', draw);

function draw(e) {
    if (!drawing) return;
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    document.getElementById("result").innerText = "Prediction: ...";
}

async function predict() {
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let = input = tf.browser.fromPixels(imgData).resizeNearestNeighbor([28, 28]).mean(2).expandDims(0).expandDims(-1).toFloat().div(tf.scalar(255));
    let model = await tf.loadLayersModel('model/model.json');
    let prediction = model.predict(input);
    const probs = prediction.dataSync();
    const predictedIndex = probs.indexOf(Math.max(...probs));
    document.getElementById("result").innerText = `Prediction: ${predictedIndex}`;
}

