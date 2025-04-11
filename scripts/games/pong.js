/**
 * Pong Game - JavaScript Arcade
 * A classic two-player table tennis game
 */

// Game state
let gameRunning = false;
let animationFrame;

// Get canvas element
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions based on container size
const resizeCanvas = () => {
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Set to 80% of container or max 800x600
    canvas.width = Math.min(800, containerWidth * 0.8);
    canvas.height = Math.min(600, containerHeight * 0.8);
    
    // Reposition game elements after resize
    if (gameRunning) {
        player1.x = 0;
        player2.x = canvas.width - player2.width;
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
    }
};

// Call resize on load and window resize
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Game settings
const settings = {
    fps: 60,
    speed: 4.0,
    maxScore: 5,
    aiDifficulty: 0.7  // 0 to 1, higher is smarter
};

// Game info for Player 1
const player1 = {
    x: 0,
    y: 50,
    speed: 5,
    width: 15,
    height: 100,
    score: 0,
    color: 'teal'
};

// Game info for Player 2
const player2 = {
    x: 785,
    y: 450,
    speed: 5,
    width: 15,
    height: 100,
    score: 0,
    color: 'hotpink',
    isAI: true  // Default to AI opponent
};

// Game info for the ball
const ball = {
    x: 400,
    y: 300,
    width: 10,
    height: 10,
    speedX: settings.speed,
    speedY: -settings.speed,
    color: 'white'
};

// Keyboard state tracking
const keyPress = {
    KeyW: false,
    KeyS: false,
    ArrowUp: false,
    ArrowDown: false
};

// Sound effects
const sounds = {
    paddleHit: new Audio('../assets/sounds/pong-paddle.mp3'),
    wallHit: new Audio('../assets/sounds/pong-wall.mp3'),
    score: new Audio('../assets/sounds/pong-score.mp3')
};

// Try to load sounds, but don't break the game if they don't exist
sounds.paddleHit.volume = 0.3;
sounds.wallHit.volume = 0.2;
sounds.score.volume = 0.5;

// Mute all sounds if they fail to load
Object.values(sounds).forEach(sound => {
    sound.addEventListener('error', () => {
        sound.volume = 0;
    });
});

// Keyboard event listeners
document.addEventListener('keydown', (event) => {
    if (event.code in keyPress) {
        keyPress[event.code] = true;
    }
    
    // Pause game on Escape key
    if (event.code === 'Escape' && gameRunning) {
        togglePause();
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code in keyPress) {
        keyPress[event.code] = false;
    }
});

// Collision detection
const checkCollision = (obj1, obj2) => {
    return obj1.x < (obj2.x + obj2.width) && 
           (obj1.x + obj1.width) > obj2.x && 
           obj1.y < (obj2.y + obj2.height) && 
           (obj1.y + obj1.height) > obj2.y;
};

// Reset ball after score
const resetBall = () => {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    
    // Randomize direction
    ball.speedX = settings.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.speedY = settings.speed * (Math.random() > 0.5 ? 1 : -1);
};

// Reset game
const resetGame = () => {
    player1.score = 0;
    player1.x = 0;
    player1.y = (canvas.height - player1.height) / 2;
    
    player2.score = 0;
    player2.x = canvas.width - player2.width;
    player2.y = (canvas.height - player2.height) / 2;
    
    resetBall();
    
    // Update the score display
    document.getElementById('score-value').textContent = `${player1.score}-${player2.score}`;
};

// AI movement for player 2
const moveAI = () => {
    if (!player2.isAI) return;
    
    // Difficulty affects how perfectly the AI tracks the ball
    const difficulty = settings.aiDifficulty;
    const reaction = Math.random() < difficulty;
    
    if (reaction && ball.speedX > 0) {  // Only move when ball is coming towards AI
        const ballCenter = ball.y + ball.height / 2;
        const paddleCenter = player2.y + player2.height / 2;
        
        // Move towards the ball with some randomness
        if (paddleCenter < ballCenter - 10) {
            player2.y += player2.speed * (difficulty + Math.random() * 0.3);
        } else if (paddleCenter > ballCenter + 10) {
            player2.y -= player2.speed * (difficulty + Math.random() * 0.3);
        }
    }
    
    // Keep AI paddle within bounds
    if (player2.y < 0) {
        player2.y = 0;
    } else if (player2.y + player2.height > canvas.height) {
        player2.y = canvas.height - player2.height;
    }
};

// Move game objects
const move = () => {
    // Player 1 movement
    if (keyPress.KeyW) {
        if (player1.y > 0) {
            player1.y -= player1.speed;
        }
    } else if (keyPress.KeyS) {
        if ((player1.y + player1.height) < canvas.height) {
            player1.y += player1.speed;
        }
    }
    
    // Player 2 movement (if human)
    if (!player2.isAI) {
        if (keyPress.ArrowUp) {
            if (player2.y > 0) {
                player2.y -= player2.speed;
            }
        } else if (keyPress.ArrowDown) {
            if ((player2.y + player2.height) < canvas.height) {
                player2.y += player2.speed;
            }
        }
    } else {
        moveAI();
    }
    
    // Ball movement
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    
    // Ball hits top or bottom
    if (ball.y <= 0 || ball.y + ball.height >= canvas.height) {
        ball.speedY *= -1;
        sounds.wallHit.play().catch(() => {});
    }
    
    // Ball goes out of bounds (scoring)
    if (ball.x < 0) {
        player2.score++;
        sounds.score.play().catch(() => {});
        document.getElementById('score-value').textContent = `${player1.score}-${player2.score}`;
        
        if (player2.score >= settings.maxScore) {
            endGame(false);
        } else {
            resetBall();
        }
    } else if (ball.x > canvas.width) {
        player1.score++;
        sounds.score.play().catch(() => {});
        document.getElementById('score-value').textContent = `${player1.score}-${player2.score}`;
        
        if (player1.score >= settings.maxScore) {
            endGame(true);
        } else {
            resetBall();
        }
    }
    
    // Ball hits player 1 paddle
    if (checkCollision(ball, player1)) {
        ball.speedX = Math.abs(ball.speedX); // Ensure ball moves right
        sounds.paddleHit.play().catch(() => {});
        
        // Change Y direction based on where the ball hits the paddle
        const hitPosition = (ball.y + ball.height/2) - (player1.y + player1.height/2);
        ball.speedY = hitPosition * 0.2;
    }
    
    // Ball hits player 2 paddle
    if (checkCollision(ball, player2)) {
        ball.speedX = -Math.abs(ball.speedX); // Ensure ball moves left
        sounds.paddleHit.play().catch(() => {});
        
        // Change Y direction based on where the ball hits the paddle
        const hitPosition = (ball.y + ball.height/2) - (player2.y + player2.height/2);
        ball.speedY = hitPosition * 0.2;
    }
};

// Draw game elements
const draw = () => {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw player 1 paddle
    ctx.fillStyle = player1.color;
    ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
    
    // Draw player 2 paddle
    ctx.fillStyle = player2.color;
    ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
    
    // Draw ball
    ctx.fillStyle = ball.color;
    ctx.fillRect(ball.x, ball.y, ball.width, ball.height);
    
    // Move game objects
    move();
    
    // Request next frame
    animationFrame = requestAnimationFrame(draw);
};

// Game control functions
const startGame = () => {
    resetGame();
    gameRunning = true;
    document.getElementById('start-overlay').classList.add('hidden');
    document.getElementById('pause-overlay').classList.add('hidden');
    document.getElementById('gameover-overlay').classList.add('hidden');
    animationFrame = requestAnimationFrame(draw);
};

const pauseGame = () => {
    gameRunning = false;
    document.getElementById('pause-overlay').classList.remove('hidden');
    cancelAnimationFrame(animationFrame);
};

const resumeGame = () => {
    gameRunning = true;
    document.getElementById('pause-overlay').classList.add('hidden');
    animationFrame = requestAnimationFrame(draw);
};

const togglePause = () => {
    if (gameRunning) {
        pauseGame();
    } else {
        resumeGame();
    }
};

const endGame = (player1Win) => {
    gameRunning = false;
    
    // Update final score and message
    document.getElementById('final-score').textContent = `${player1.score}-${player2.score}`;
    
    // Show game over screen
    document.getElementById('gameover-overlay').classList.remove('hidden');
    
    // Save score to localStorage
    const winner = player1Win ? 'Player 1' : (player2.isAI ? 'Computer' : 'Player 2');
    const score = player1Win ? player1.score : player2.score;
    window.gameUtils.saveScore('pong', {
        winner: winner,
        score: score,
        against: player1Win ? (player2.isAI ? 'Computer' : 'Player 2') : 'Player 1'
    });
    
    cancelAnimationFrame(animationFrame);
};

// Toggle between human and AI for player 2
const togglePlayer2AI = () => {
    player2.isAI = !player2.isAI;
    
    // Update control info
    const controlsInfo = document.querySelector('.controls-info');
    if (player2.isAI) {
        controlsInfo.innerHTML = 'Player 1: W/S keys<br>Single Player Mode';
    } else {
        controlsInfo.innerHTML = 'Player 1: W/S keys<br>Player 2: Arrow Up/Down<br>Two Player Mode';
    }
    
    // If game is running, reset positions but keep scores
    if (gameRunning) {
        player1.x = 0;
        player1.y = (canvas.height - player1.height) / 2;
        
        player2.x = canvas.width - player2.width;
        player2.y = (canvas.height - player2.height) / 2;
        
        resetBall();
    }
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up initial score display
    document.getElementById('score-value').textContent = `${player1.score}-${player2.score}`;
    
    // Update controls info
    const controlsInfo = document.querySelector('.controls-info');
    controlsInfo.innerHTML = 'Player 1: W/S keys<br>Single Player Mode';
    
    // Add mode toggle button to UI
    const gameHeader = document.querySelector('.game-header');
    const navigation = document.querySelector('.navigation');
    
    const modeToggle = document.createElement('button');
    modeToggle.classList.add('nav-button');
    modeToggle.textContent = '1P/2P Toggle';
    modeToggle.addEventListener('click', togglePlayer2AI);
    
    navigation.insertBefore(modeToggle, navigation.firstChild);
    
    // Set up event listeners for game controls
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('resume-button').addEventListener('click', resumeGame);
    document.getElementById('retry-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', startGame);
    document.getElementById('pause-button').addEventListener('click', togglePause);
    
    // Initialize canvas position
    resizeCanvas();
});