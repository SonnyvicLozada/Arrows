<script>
    let mainCampaignLevel = 1, health = 3, originalHealthThisLevel = 3;
    let isDailyChallengeMode = false, winStreakCount = 0;
    let currentSelectedDay = 1, currentSelectedMonth = 0, currentSelectedYear = 2026;
    let completedDatesRegistry = {}, unlockedTrophies = { flawless: false, streak: false, master: false, first: false };

    const positiveFeedbacks = ["Good", "Very Good", "Ultra Good", "Excellent", "Very Excellent"];
    const negativeFeedbacks = ["Bad", "Very Bad"];
    const difficultiesList = [
        { name: "Easy", className: "diff-easy" }, { name: "Low", className: "diff-low" },
        { name: "Medium", className: "diff-medium" }, { name: "Hard", className: "diff-hard" },
        { name: "Ultra Hard", className: "diff-ultrahard" }
    ];

    const mazePattern = [
        { arrow: '➡️', isCorrect: true },  { arrow: '⬇️', isCorrect: true },  { arrow: '➡️', isCorrect: true },  { arrow: '⬇️', isCorrect: true },
        { arrow: '⬆️', isCorrect: false }, { arrow: '⬅️', isCorrect: false }, { arrow: '⬇️', isCorrect: false }, { arrow: '➡️', isCorrect: true },
        { arrow: '⬅️', isCorrect: false }, { arrow: '⬆️', isCorrect: false }, { arrow: '⬇️', isCorrect: true },  { arrow: '➡️', isCorrect: true },
        { arrow: '⬇️', isCorrect: false }, { arrow: '⬅️', isCorrect: false }, { arrow: '⬆️', isCorrect: false }, { arrow: '👊', isCorrect: true }
    ];
    const monthsNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    window.onload = function() { renderCalendar(); refreshTrophyUI(); };

    function switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active-nav'));
        document.getElementById(`screen-${screenId}`).classList.add('active-screen');
        document.getElementById(`nav-${screenId}`).classList.add('active-nav');
        if(screenId === 'challenge') {
            document.getElementById('calendar-menu-view').style.display = 'block';
            document.getElementById('gameplay-view').style.display = 'none';
            renderCalendar();
        }
        if(screenId === 'collection') refreshTrophyUI();
    }

    function startMainLevel() {
        isDailyChallengeMode = false; originalHealthThisLevel = health;
        document.getElementById('stage-title').innerText = `Level ${mainCampaignLevel}`;
        document.getElementById('date-subtitle').innerText = "Main Campaign Path";
        const diffIndex = Math.min(Math.floor((mainCampaignLevel - 1) / 2), difficultiesList.length - 1);
        const currentDiff = difficultiesList[diffIndex];
        document.getElementById('difficulty-wrapper').innerHTML = `<span class="diff-badge ${currentDiff.className}">${currentDiff.name}</span>`;
        document.getElementById('screen-home').classList.remove('active-screen');
        document.getElementById('screen-challenge').classList.add('active-screen');
        document.getElementById('calendar-menu-view').style.display = 'none';
        document.getElementById('gameplay-view').style.display = 'block';
        loadMazeGridEngine();
    }
    