class TreasureGame {
    constructor() {
    this.mapSize = 20;
    this.map = document.getElementById('map');
    this.message = document.getElementById('message');
    this.inputSection = document.getElementById('inputSection');
    this.userInput = document.getElementById('userInput');
    this.submitButton = document.getElementById('submitButton');
    this.inputError = document.getElementById('inputError');
    
        this.characterX = 0;
        this.characterY = 0;
        this.isTempleMap = false;
        this.gameOver = false;
        
        this.guards = [
            { x: 13, y: 1 },
            { x: 5, y: 9 },
            { x: 16, y: 17 }
        ];
    
        this.init();
    }
    
    init() {
        this.initializeMap();
        this.setupEventListeners();
    }
    
    initializeMap() {
        this.gameOver = false;
        this.map.innerHTML = '';
        
        for (let i = 0; i < this.mapSize * this.mapSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            this.map.appendChild(cell);
        }
    
        const cells = document.getElementsByClassName('cell');
    
        if (!this.isTempleMap) {
            cells[14 * this.mapSize + 6].classList.add('library');
            cells[5 * this.mapSize + 14].classList.add('activity-room');
        } else {
            this.guards.forEach(guard => {
                cells[guard.y * this.mapSize + guard.x].classList.add('guard');
            });
            cells[9 * this.mapSize + 9].classList.add('treasure');
            this.startGuardMovement();
        }
    
        this.characterX = 0;
        this.characterY = 0;
        const character = document.createElement('div');
        character.className = 'character';
        cells[0].appendChild(character);
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleMovement(e));
        this.submitButton.addEventListener('click', () => this.handleInput());
    }
    
    async handleMovement(e) {
        if (this.gameOver) return;
    
        const cells = document.getElementsByClassName('cell');
        const character = document.querySelector('.character');
        cells[this.characterY * this.mapSize + this.characterX].removeChild(character);
    
        let newX = this.characterX;
        let newY = this.characterY;
    
        switch (e.key) {
            case 'ArrowUp': if (newY > 0) newY--; break;
            case 'ArrowDown': if (newY < this.mapSize - 1) newY++; break;
            case 'ArrowLeft': if (newX > 0) newX--; break;
            case 'ArrowRight': if (newX < this.mapSize - 1) newX++; break;
        }
    
        this.characterX = newX;
        this.characterY = newY;
        cells[this.characterY * this.mapSize + this.characterX].appendChild(character);
    
        await this.checkPosition();
    }
    
    async checkPosition() {
        if (!this.isTempleMap) {
            if (this.characterX === 6 && this.characterY === 14) {
                await this.handleLibraryEvent();
            } else if (this.characterX === 14 && this.characterY === 5) {
                this.message.textContent = "此处为活动室，没有线索可以解码";
            } else {
                this.message.textContent = "";
            }
        } else {
            if (this.characterX === 9 && this.characterY === 9) {
                await this.handleTreasureEvent();
            }
            
            for (let guard of this.guards) {
                if (this.characterX === guard.x && this.characterY === guard.y) {
                    this.gameOver = true;
                    this.message.textContent = "糟糕!遇到了神庙守卫!\n任务失败";
                    return;
                }
            }
        }
    }
    
    async handleLibraryEvent() {
        this.message.textContent = "在古老的图书馆找到了第一个线索…\n请写出宝藏的英文";
        const answer = await this.getUserInput();
        
        if (answer.toLowerCase() === "treasure") {
            const enterTemple = await this.askQuestion("解码成功！宝藏在一座古老的神庙中...\n是否进入神庙?");
            if (enterTemple) {
                this.message.textContent = "你选择了进入神庙，继续冒险！";
                this.isTempleMap = true;
                this.initializeMap();
            } else {
                this.gameOver = true;
                this.message.textContent = "任务失败";
            }
        } else {
            this.gameOver = true;
            this.message.textContent = "答案错误\n任务失败";
        }
    }
    
    async handleTreasureEvent() {
        this.message.textContent = "找到了一个神秘的箱子...\n若想打开箱子请回答神庙里共有几个守卫";
        const answer = await this.getUserInput();
        
        if (answer === "3") {
            this.gameOver = true;
            this.message.textContent = "恭喜!你找到了传说中的宝藏!";
        } else {
            this.gameOver = true;
            this.message.textContent = "答案错误\n任务失败";
        }
    }
    
    getUserInput() {
        return new Promise(resolve => {
            this.inputSection.style.display = 'block';
            this.userInput.value = '';
            
            const handleSubmit = () => {
                const value = this.userInput.value.trim();
                this.inputSection.style.display = 'none';
                resolve(value);
            };
    
            this.submitButton.onclick = handleSubmit;
        });
    }
    
    async askQuestion(question) {
        this.message.textContent = question;
        return new Promise(resolve => {
            const yesButton = document.createElement('button');
            const noButton = document.createElement('button');
            
            yesButton.textContent = "是";
            noButton.textContent = "否";
            
            yesButton.onclick = () => {
                yesButton.remove();
                noButton.remove();
                resolve(true);
            };
            
            noButton.onclick = () => {
                yesButton.remove();
                noButton.remove();
                resolve(false);
            };
            
            this.message.appendChild(yesButton);
            this.message.appendChild(noButton);
        });
    }
    
    startGuardMovement() {
        setInterval(() => {
            if (this.gameOver) return;
            
            const cells = document.getElementsByClassName('cell');
            
            this.guards.forEach(guard => {
                cells[guard.y * this.mapSize + guard.x].classList.remove('guard');
                
                const directions = [
                    { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
                    { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
                ];
                
                const randomDirection = directions[Math.floor(Math.random() * directions.length)];
                const newX = guard.x + randomDirection.dx;
                const newY = guard.y + randomDirection.dy;
                
                if (newX >= 0 && newX < this.mapSize && newY >= 0 && newY < this.mapSize) {
                    guard.x = newX;
                    guard.y = newY;
                }
                
                cells[guard.y * this.mapSize + guard.x].classList.add('guard');
                
                if (guard.x === this.characterX && guard.y === this.characterY) {
                    this.gameOver = true;
                    this.message.textContent = "糟糕!遇到了神庙守卫!\n任务失败";
                }
            });
        }, 1000);
    }
    }
    new TreasureGame();