let gameState = {
    isPlaying: false,
    currentRound: 1,
    maxRounds: 5, 
    score: 0, 
    timeLeft: 30,
    timer: null,
    prompts: ['house', 'car', 'tree', 'cat', 'sun', 'flower', 'fish', 'bird', 'cake', 'umbrella'],
    currentPrompts: [],
    currentPromptIndex: 0,
}

// AI model variables 
let classifier;
let isModelLoaded = false;
let predictionTimer = null;

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;

function initCanvas() {
    ctx.strokeStyle = '#000';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;
    clearCanvas();
}

async function loadModel() {
    try {
        classifier = await ml5.imageClassifier('DoodleNet', modelReady)
    } catch (error) {
        console.error('error loading AI model', error);
        document.getElementById('modelStatus').textContent = 'AI not working';
        document.getElementById('modelStatus').style.color = '#ff6b6b';
    }
}

function modelReady() {
    console.log('AI loaded');
    isModelLoaded = true;
    document.getElementById('modelStatus').textContent = 'AI working';
    document.getElementById('modelStatus').style.color = '#26de81';
}

function startPredictionLoop() {
    if (predictionTimer) clearInterval(predictionTimer);

    predictionTimer = setInterval(() => {
        if (isModelLoaded && gameState.isPlaying) {
            classifyDrawing();
        }
    }, 1000);
}

function stopPredictionLoop() {
    if (predictionTimer) clearInterval(predictionTimer)
}

function classifyDawing() {
    classifier.classify(canvas, gotResult);
}

function gotResult(error, results) {
    if (error) {
        console.error(error);
        return;
    }
    if (!results || results.length == 0) return;

    const prediction = results[0].label;
    const confidence = results[0].confidence;

    console.log('Prediction: ${prediction}, Confidence: ${confidence}');

    const currentPrompt = gameState.currentPrompts[gameState.currentPromptIndex];

    if (prediction.toLowerCase() === currentPrompt.toLowerCase() && confidence > 0.5) {
        clearInterval(gameState.timer);
        nextRound(true);
    }
}

function startDrawing(e) {
    if (!gameState.isPlaying) return;
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.offsetX;
    lastY = e.offsetY;
}

function draw(e) {
    if (!isDrawing || !gameState.isPlaying) return;
    currentX = e.offsetX;
    currentY = e.offsetY;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    lastX = currentX;
    lastY = currentY;
}

function stopDrawing() {
    isDrawing = false;
}

function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
    };
}

function handleTouchStart(e) {
    if (!gameState.isPlaying) return;
    isDrawing = true;
    const pos = getTouchPos(e);
    lastX = pos.x;
    lastY = pos.y;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing || !gameState.isPlaying) return;
    const touch = getTouchPos(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(touch.x, touch.y);
    ctx.stroke();
    lastX = touch.x;
    lastY = touch.y;
}

function handleTouchEnd() {
    e.preventDefault();
    isDrawing = false;
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

function startGame() {
    gameState.isPlaying = true;
    gameState.currentRound = 1;
    gameState.score = 0;
    gameState.currentPrompts = shuffleArray([...gameState.prompts]).slice(0, gameState.maxRounds);
    gameState.currentPromptIndex = 0;

    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('gameOver').classList.add('hidden');

    initCanvas();
    loadModel();
    startRound();
}

function startRound() {
    gameState.timeLeft = 30;
    clearCanvas();
    updateDisplay();
    startTimer();
    startPredictionLoop();
}

function startTimer() {
    if(gameState.timer) clearInterval(gameState.timer);

    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        document.getElementById('timeLeft').textContent = gameState.timeLeft;

        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            nextRound();
        }
    }, 1000);
}

function nextRound() {
    if (gameState.timer) clearInterval(gameState.timer);

    gameState.score++;

    if (gameState.currentRound >= gameState.maxRounds) {
        endGame();
    } else {
        gameState.currentRound++;
        gameState.currentPromptIndex++;
        startRound();
    }
}

function endGame() {
    gameState.isPlaying = false;
    stopPredictionLoop();
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('finalScore').textContent = gameState.score;
}

function restartGame() {
    startGame();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateDisplay() {
    document.getElementById('currentPrompt').textContent = gameState.currentPrompts[gameState.currentPromptIndex];
    document.getElementById('currentRound').textContent = gameState.currentRound;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('timeLeft').textContent = gameState.timeLeft;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

gameState.isPlaying = true;
initCanvas();
