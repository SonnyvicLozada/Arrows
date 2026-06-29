let modes = {
    normal: { level: 1 },
    easy: { level: 1 },
    hard: { level: 1 },
    ultrahard: { level: 1 }
};

let currentMode = "normal";
let currentLevel = 1;
let health = 3;
let originalHealthThisLevel = 3;
let winStreakCount = 0;
let noWrongTouchStreak = 0;
let totalWins = 0;
let unlockedTrophies = { flawless: false, streak: false, master: false, first: false, excellent: false, wins100: false, nowrong: false };
let currentPattern = [];
let targetDirection = "top";

const positiveFeedbacks = ["Good", "Very Good", "Ultra Good", "Excellent", "Very Excellent"];
const negativeFeedbacks = ["Bad", "Very Bad"];
const directions = ["top", "right", "left", "down"];
const directionMap = { top: "⬆️", right: "➡️", left: "⬅️", down: "⬇️" };

window.onload = function() {
    updateProgressUI();
    refreshTrophyUI();
    updateHearts();
};

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active-nav'));
    document.getElementById(`screen-${screenId}`).classList.add('active-screen');
    const nav = document.getElementById(`nav-${screenId}`);
    if (nav) nav.classList.add('active-nav');
    document.getElementById('heart-box').classList.toggle('show', screenId === 'game');
}

function startMode(mode) {
    currentMode = mode;
    currentLevel = modes[mode].level;
    originalHealthThisLevel = health;
    targetDirection = directions[(currentLevel - 1) % directions.length];
    document.getElementById('stage-title').innerText = `${mode.toUpperCase()} Level ${currentLevel}`;
    document.getElementById('clue-text').innerText = `Clue: Find the ${targetDirection} arrow`;
    document.getElementById('date-subtitle').innerText = `${mode.toUpperCase()} Mode`;
    document.getElementById('difficulty-wrapper').innerHTML = `<span class="diff-badge diff-medium">${mode.toUpperCase()}</span>`;
    document.getElementById('screen-home').classList.remove('active-screen');
    document.getElementById('screen-game').classList.add('active-screen');
    document.getElementById('heart-box').classList.add('show');
    loadMazeGridEngine();
}

function buildPattern() {
    const correctArrow = directionMap[targetDirection];
    const distractors = directions.filter(d => d !== targetDirection).map(d => directionMap[d]);
    const correctCount = Math.min(2 + Math.floor(currentLevel / 2), 9);
    const wrongCount = Math.min(4 + currentLevel, 20);
    const pattern = [];
    for (let i = 0; i < correctCount; i++) pattern.push({ arrow: correctArrow, isCorrect: true });
    for (let i = 0; i < wrongCount; i++) pattern.push({ arrow: distractors[Math.floor(Math.random() * distractors.length)], isCorrect: false });
    for (let i = pattern.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pattern[i], pattern[j]] = [pattern[j], pattern[i]]; }
    return pattern;
}

function loadMazeGridEngine() {
    const board = document.getElementById('maze-board');
    board.innerHTML = '';
    currentPattern = buildPattern();
    board.style.gridTemplateColumns = currentPattern.length > 16 ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)';
    document.getElementById('feedback-msg').innerText = `Tap only the ${targetDirection} arrows.`;
    document.getElementById('feedback-msg').style.color = "var(--primary-color)";

    currentPattern.forEach((blockData, index) => {
        const block = document.createElement('div');
        block.className = 'path-block arrow-pop';
        block.style.animationDelay = `${index * 0.03}s`;
        block.innerText = blockData.arrow;

        block.addEventListener('click', () => {
            if (blockData.isCorrect) {
                if (block.classList.contains('selected') || block.classList.contains('correct-flow')) return;

                block.classList.add('selected');
                triggerPopText(true);

                const remainingCorrect = [...board.children].some(child => {
                    return child.innerText === directionMap[targetDirection] && !child.classList.contains('selected') && !child.classList.contains('correct-flow');
                });

                if (!remainingCorrect) {
                    document.querySelectorAll('.path-block').forEach(b => b.classList.add('correct-flow'));
                    totalWins++;
                    winStreakCount++;
                    noWrongTouchStreak++;

                    if (originalHealthThisLevel === health) unlockedTrophies.flawless = true;
                    if (winStreakCount >= 3) unlockedTrophies.streak = true;
                    if (totalWins >= 100) unlockedTrophies.wins100 = true;
                    if (noWrongTouchStreak >= 1000) unlockedTrophies.nowrong = true;
                    if (currentLevel >= 5) unlockedTrophies.master = true;
                    unlockedTrophies.first = true;
                    unlockedTrophies.excellent = true;

                    refreshTrophyUI();
                    modes[currentMode].level++;
                    updateProgressUI();

                    setTimeout(() => {
                        currentLevel = modes[currentMode].level;
                        originalHealthThisLevel = health;
                        targetDirection = directions[(currentLevel - 1) % directions.length];
                        document.getElementById('stage-title').innerText = `${currentMode.toUpperCase()} Level ${currentLevel}`;
                        document.getElementById('clue-text').innerText = `Clue: Find the ${targetDirection} arrow`;
                        document.getElementById('date-subtitle').innerText = `${currentMode.toUpperCase()} Mode`;
                        document.getElementById('difficulty-wrapper').innerHTML = `<span class="diff-badge diff-medium">${currentMode.toUpperCase()}</span>`;
                        loadMazeGridEngine();
                    }, 500);
                }
            } else {
                health--;
                winStreakCount = 0;
                noWrongTouchStreak = 0;
                updateHearts(true);
                triggerPopText(false);
                block.classList.add('wrong');
                setTimeout(() => block.classList.remove('wrong'), 400);

                if (health <= 0) {
                    alert("Game Over! Walang natitirang buhay.");
                    health = 3;
                    updateHearts();
                    switchScreen('home');
                }
            }
        });

        board.appendChild(block);
    });
}

function updateProgressUI() {
    document.getElementById('normal-progress').innerText = `Level ${modes.normal.level}`;
    document.getElementById('easy-progress').innerText = `Level ${modes.easy.level}`;
    document.getElementById('hard-progress').innerText = `Level ${modes.hard.level}`;
    document.getElementById('ultrahard-progress').innerText = `Level ${modes.ultrahard.level}`;
}

function triggerPopText(isCorrectHit) {
    const popEl = document.getElementById('combo-popup');
    popEl.innerText = isCorrectHit ? positiveFeedbacks[Math.floor(Math.random() * positiveFeedbacks.length)] : negativeFeedbacks[Math.floor(Math.random() * negativeFeedbacks.length)];
    popEl.style.color = isCorrectHit ? "var(--accent-green)" : "var(--accent-red)";
    popEl.classList.add('show-pop');
    setTimeout(() => popEl.classList.remove('show-pop'), 400);
}

function refreshTrophyUI() {
    if (unlockedTrophies.flawless) document.getElementById('trophy-flawless').innerText = "✅";
    if (unlockedTrophies.streak) document.getElementById('trophy-streak').innerText = "✅";
    if (unlockedTrophies.master) document.getElementById('trophy-master').innerText = "✅";
    if (unlockedTrophies.first) document.getElementById('trophy-first').innerText = "✅";
    if (unlockedTrophies.excellent) document.getElementById('trophy-excellent').innerText = "✅";
    if (unlockedTrophies.wins100) document.getElementById('trophy-100').innerText = "✅";
    if (unlockedTrophies.nowrong) document.getElementById('trophy-no-wrong').innerText = "✅";
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode', document.getElementById('toggle-dark').checked);
}

function resetGame() {
    health = 3;
    winStreakCount = 0;
    noWrongTouchStreak = 0;
    currentMode = "normal";
    currentLevel = 1;
    modes.normal.level = 1;
    updateProgressUI();
    updateHearts();
    switchScreen('home');
}

function goBack() {
    switchScreen('home');
}

function updateHearts(playAnim = false) {
    const box = document.getElementById('heart-box');
    let str = "";
    for (let i = 0; i < 3; i++) str += (i < health) ? "❤️" : "🖤";
    box.innerText = str;
    if (playAnim) {
        box.classList.remove('shake');
        void box.offsetWidth;
        box.classList.add('shake');
    }
}