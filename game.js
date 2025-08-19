class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        
        // 游戏配置
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // 游戏状态
        this.snake = [
            {x: 10, y: 10}
        ];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        
        // 初始化
        this.initializeGame();
        this.setupEventListeners();
        this.updateHighScoreDisplay();
    }
    
    initializeGame() {
        this.generateFood();
        this.drawGame();
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });
        
        // 按钮控制
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.dx = 1;
            this.dy = 0;
            this.gameLoop();
            this.updateButtonStates();
        }
    }
    
    togglePause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            if (!this.gamePaused) {
                this.gameLoop();
            }
            this.updateButtonStates();
        }
    }
    
    restartGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.updateScore();
        this.generateFood();
        this.drawGame();
        this.updateButtonStates();
        this.removeGameOverScreen();
    }
    
    updateButtonStates() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const restartBtn = document.getElementById('restartBtn');
        
        startBtn.disabled = this.gameRunning;
        pauseBtn.disabled = !this.gameRunning;
        pauseBtn.textContent = this.gamePaused ? '继续' : '暂停';
        restartBtn.disabled = false;
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        setTimeout(() => {
            this.clearCanvas();
            this.moveSnake();
            this.drawFood();
            this.drawSnake();
            
            if (this.checkGameOver()) {
                this.endGame();
                return;
            }
            
            this.gameLoop();
        }, 150); // 游戏速度
    }
    
    clearCanvas() {
        this.ctx.fillStyle = '#f7fafc';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    moveSnake() {
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
        } else {
            this.snake.pop();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#2d3748';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 1,
                    segment.y * this.gridSize + 1,
                    this.gridSize - 2,
                    this.gridSize - 2
                );
                
                // 蛇头的眼睛
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 5,
                    segment.y * this.gridSize + 5,
                    3, 3
                );
                this.ctx.fillRect(
                    segment.x * this.gridSize + 12,
                    segment.y * this.gridSize + 5,
                    3, 3
                );
            } else {
                // 蛇身
                const gradient = this.ctx.createLinearGradient(
                    segment.x * this.gridSize,
                    segment.y * this.gridSize,
                    (segment.x + 1) * this.gridSize,
                    (segment.y + 1) * this.gridSize
                );
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(
                    segment.x * this.gridSize + 1,
                    segment.y * this.gridSize + 1,
                    this.gridSize - 2,
                    this.gridSize - 2
                );
            }
        });
    }
    
    generateFood() {
        let foodPosition;
        do {
            foodPosition = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => 
            segment.x === foodPosition.x && segment.y === foodPosition.y
        ));
        
        this.food = foodPosition;
    }
    
    drawFood() {
        // 绘制食物（苹果样式）
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // 苹果主体
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize / 2,
            y + this.gridSize / 2,
            this.gridSize / 3,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // 苹果叶子
        this.ctx.fillStyle = '#38a169';
        this.ctx.fillRect(
            x + this.gridSize / 2 - 1,
            y + 3,
            2,
            6
        );
    }
    
    checkGameOver() {
        const head = this.snake[0];
        
        // 检查是否撞墙
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        // 检查是否撞到自己
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    endGame() {
        this.gameRunning = false;
        this.updateButtonStates();
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
            this.updateHighScoreDisplay();
        }
        
        this.showGameOverScreen();
    }
    
    showGameOverScreen() {
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <h2>游戏结束!</h2>
            <p>最终得分: ${this.score}</p>
            <p>最高分: ${this.highScore}</p>
            <button onclick="game.restartGame()">再来一局</button>
        `;
        document.body.appendChild(gameOverDiv);
    }
    
    removeGameOverScreen() {
        const gameOverScreen = document.querySelector('.game-over');
        if (gameOverScreen) {
            gameOverScreen.remove();
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }
    
    drawGame() {
        this.clearCanvas();
        this.drawFood();
        this.drawSnake();
    }
}

// 初始化游戏
let game;
window.addEventListener('load', () => {
    game = new SnakeGame();
});

// 防止方向键滚动页面
window.addEventListener('keydown', (e) => {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});