let gameState = {
    isPlaying: false,
    currentRound: 1, 
    maxRounds: 4,
    score: 0,
    timeLeft: 30,
    timer: null,
    prompts: ['dog', 'cat', 'bird', 'fish', 'cow', 'pig', 'giraffe'],
    currentPrompts: [],
    currentPromptIndex: 0,
}

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;

function initCanvas() {
    ctx.strokeStyle = '#000';
    ctx.lineJoin = 'round',
    ctx.lineCap = 'round',
    ctx.lineWidth = 5;
}

function draw(e) {
    if (!isDrawing || !gameState.isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

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
    lastX = touch.x;
    lastY = touch.y;
}

