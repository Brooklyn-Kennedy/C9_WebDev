let maxHp = parseInt(localStorage.getItem("maxHp")) || 100;
let hp = maxHp;  // Ensure HP is set to max on respawn
let hpDrain = 1; // Standard HP drain rate
let food = 0;  // Starting food
let cookedMeals = 0;  // Starting cooked meals
let inventoryCapacity = 25;  // Maximum inventory capacity
let gathering = false;
let cooking = false;
let mining = false;
let combat = false;
let socialising = false;
let eatCooldown = false;
let gameRunning = false;
let survivalTime = parseFloat(localStorage.getItem("survivalTime")) || 0;
let timerInterval;
let overflowProgress = 0;  // Ensure overflow progress is initialized

// Job classes with localStorage persistence
let jobClasses = JSON.parse(localStorage.getItem("jobClasses")) || {
    gathering: { level: 1, xp: 0, multiplier: 1 },
    cooking: { level: 1, xp: 0, multiplier: 1 },
    mining: { level: 1, xp: 0, multiplier: 1 },
    combat: { level: 1, xp: 0, multiplier: 1 },
    socialising: { level: 1, xp: 0, multiplier: 1 }
};

function updateUI() {
    document.getElementById('hp').textContent = hp;
    document.getElementById('max-hp').textContent = maxHp;
    document.getElementById('food').textContent = food;
    document.getElementById('cooked-meals').textContent = cookedMeals;
    document.getElementById('hp-drain').textContent = hpDrain.toFixed(2);
    document.getElementById('survival-time').textContent = survivalTime;
    document.getElementById('gathering-xp-bar').style.width = (jobClasses.gathering.xp / (jobClasses.gathering.level * 25) * 100) + '%';
    document.getElementById('cooking-xp-bar').style.width = (jobClasses.cooking.xp / (jobClasses.cooking.level * 25) * 100) + '%';
    document.getElementById('mining-xp-bar').style.width = (jobClasses.mining.xp / (jobClasses.mining.level * 25) * 100) + '%';
    document.getElementById('combat-xp-bar').style.width = (jobClasses.combat.xp / (jobClasses.combat.level * 25) * 100) + '%';
    document.getElementById('socialising-xp-bar').style.width = (jobClasses.socialising.xp / (jobClasses.socialising.level * 25) * 100) + '%';
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        timerInterval = setInterval(() => {
            survivalTime += 1;
            localStorage.setItem("survivalTime", survivalTime);
        }, 1000);
    }
}

function stopGame() {
    if (!gathering && !cooking) {
        gameRunning = false;
        clearInterval(timerInterval);
    }
}

function passiveDrain() {
    if (!gameRunning) return;
    hp -= hpDrain;
    if (hp <= 0) {
        alert("Game Over! Your max HP increased.");
        localStorage.setItem("maxHp", maxHp + Math.floor(survivalTime / 10));
        localStorage.setItem("jobClasses", JSON.stringify(jobClasses));
        localStorage.setItem("survivalTime", 0);
        location.reload();
    }
    if (gameRunning) {
        hpDrain += 0.01;  // HP drain only increases while game is running
    }
    autoEat();
    updateUI();
}
setInterval(passiveDrain, 1000);

function gainXP(job, amount) {
    jobClasses[job].xp += amount;
    if (jobClasses[job].xp >= jobClasses[job].level * 25) {
        jobClasses[job].xp = 0;
        jobClasses[job].level++;
        jobClasses[job].multiplier = Math.pow(1.01, jobClasses[job].level - 1);
    }
    localStorage.setItem("jobClasses", JSON.stringify(jobClasses));
    updateUI();
}

function gatherFood() {
    console.log("Gather Food button clicked!");
    if (gathering || food >= inventoryCapacity) return;
    startGame();
    gathering = true;

    let progress = 0;
    let interval = setInterval(() => {
        progress += (100 / (5 / jobClasses.gathering.multiplier));
        document.getElementById('gather-progress').style.width = progress + '%';

        if (progress >= 100) {
            clearInterval(interval);
            food++;
            gainXP("gathering", 5);
            gathering = false;
            document.getElementById('gather-progress').style.width = '0%';

            if (food < inventoryCapacity) {
                gatherFood();
            } else {
                stopGame();
            }
        }
    }, 1000);
}

function cookMeal() {
    console.log("Cook Meal button clicked!");
    if (cooking || food < 2 || cookedMeals >= inventoryCapacity) return;
    startGame();
    cooking = true;

    let progress = overflowProgress || 0;
    let interval = setInterval(() => {
        progress += (100 / (5 / jobClasses.cooking.multiplier));
        document.getElementById('cook-progress').style.width = progress + '%';

        if (progress >= 100) {
            overflowProgress = progress - 100;
            clearInterval(interval);
            food -= 2;
            cookedMeals++;
            gainXP("cooking", 5);
            cooking = false;
            document.getElementById('cook-progress').style.width = '0%';

            if (food >= 2 && cookedMeals < inventoryCapacity) {
                cookMeal();
            } else {
                stopGame();
            }
        }
    }, 1000);
}

// Attach event listeners
document.getElementById("gather-food-btn").addEventListener("click", gatherFood);
document.getElementById("cook-meal-btn").addEventListener("click", cookMeal);

// Load previous data
updateUI();
