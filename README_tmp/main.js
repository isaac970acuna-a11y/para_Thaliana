const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

let board = Array(9).fill('');
let player = 'X'; // Humano
let bot = 'O';
let gameActive = true;

function drawBoard() {
    boardElement.innerHTML = '';
    board.forEach((cell, i) => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell';
        cellDiv.textContent = cell;
        cellDiv.addEventListener('click', () => handleCellClick(i));
        boardElement.appendChild(cellDiv);
    });
}

function handleCellClick(index) {
    if (!gameActive || board[index] !== '') return;
    board[index] = player;
    drawBoard();
    if (checkWinner(player)) {
        endGame('¡Ganaste!');
        return;
    }
    if (board.every(cell => cell !== '')) {
        endGame('¡Empate!');
        return;
    }
    botMove();
}

function botMove() {
    // 1. Intentar ganar
    let move = findBestMove(bot);
    // 2. Bloquear al jugador
    if (move === null) move = findBestMove(player);
    // 3. Si no hay jugada ganadora ni para bloquear, elige al azar
    if (move === null) {
        let empty = board.map((v, i) => v === '' ? i : null).filter(i => i !== null);
        if (empty.length === 0) return;
        move = empty[Math.floor(Math.random() * empty.length)];
    }
    board[move] = bot;
    drawBoard();
    if (checkWinner(bot)) {
        endGame('Le debes un beso a mi creador');
        return;
    }
    if (board.every(cell => cell !== '')) {
        endGame('¡Empate!');
    }
}

// Busca si hay una jugada ganadora para el "mark" (bot o jugador)
function findBestMove(mark) {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (let line of wins) {
        const [a, b, c] = line;
        const values = [board[a], board[b], board[c]];
        // Si hay dos del mismo mark y una vacía
        if (values.filter(v => v === mark).length === 2 && values.includes('')) {
            return line[values.indexOf('')];
        }
    }
    return null;
}

function checkWinner(mark) {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    return wins.some(line => line.every(i => board[i] === mark));
}

function endGame(msg) {
    gameActive = false;
    messageElement.textContent = msg;
    restartBtn.style.display = 'inline-block';
    if (msg.includes('Le debes un beso')) {
        showConfetti();
        messageElement.textContent = 'Le debes un beso a mi creador Isaac';
    }
}

// Confeti simple
function showConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    let pieces = [];
    for (let i = 0; i < 150; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * 40 + 10,
            color: `hsl(${Math.random()*360},80%,60%)`,
            tilt: Math.random() * 10 - 10
        });
    }
    let angle = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < pieces.length; i++) {
            let p = pieces[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, false);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
        update();
    }
    function update() {
        angle += 0.01;
        for (let i = 0; i < pieces.length; i++) {
            let p = pieces[i];
            p.y += (Math.cos(angle + p.d) + 3 + p.r/2) * 0.8;
            p.x += Math.sin(angle) * 2;
            if (p.y > canvas.height) {
                p.x = Math.random() * canvas.width;
                p.y = Math.random() * -20;
            }
        }
    }
    let duration = 2000;
    let start = null;
    function animateConfetti(ts) {
        if (!start) start = ts;
        let elapsed = ts - start;
        draw();
        if (elapsed < duration) {
            requestAnimationFrame(animateConfetti);
        } else {
            canvas.style.display = 'none';
        }
    }
    requestAnimationFrame(animateConfetti);
}

function restartGame() {
    board = Array(9).fill('');
    gameActive = true;
    messageElement.textContent = '';
    restartBtn.style.display = 'none';
    drawBoard();
}

restartBtn.addEventListener('click', restartGame);

drawBoard();
