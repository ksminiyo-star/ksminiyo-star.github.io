const defaultFoods = [
    { name: '김치찌개', emoji: '🥘' },
    { name: '된장찌개', emoji: '🍲' },
    { name: '비빔밥', emoji: '🥗' },
    { name: '불고기', emoji: '🥩' },
    { name: '삼겹살', emoji: '🥓' },
    { name: '떡볶이', emoji: '🍢' },
    { name: '김밥', emoji: '🍙' },
    { name: '라면', emoji: '🍜' },
    { name: '짜장면', emoji: '🥡' },
    { name: '샤브샤브', emoji: '🥗' },
    { name: '치킨', emoji: '🍗' },
    { name: '피자', emoji: '🍕' },
    { name: '햄버거', emoji: '🍔' },
    { name: '돈까스', emoji: '🍛' },
    { name: '초밥', emoji: '🍣' },
    { name: '순대국', emoji: '🥣' },
    { name: '칼국수', emoji: '🥢' },
    { name: '냉면', emoji: '🧊' },
    { name: '제육볶음', emoji: '🍖' },
    { name: '갈비탕', emoji: '🍲' }
];

let currentFoods = [...defaultFoods];

// Views
const homeView = document.getElementById('homeView');
const inputView = document.getElementById('inputView');
const gameView = document.getElementById('gameView');
const gameInstruction = document.getElementById('gameInstruction');

// Elements
const cardTable = document.getElementById('cardTable');
const shuffleBtn = document.getElementById('shuffleBtn');
const resetBtn = document.getElementById('resetBtn');
const resultArea = document.getElementById('resultArea');
const startBtn = document.getElementById('startBtn'); // Random Menu
const customBtn = document.getElementById('customBtn'); // Custom Input Button
const inputBackBtn = document.getElementById('inputBackBtn');
const startGameCustomBtn = document.getElementById('startGameCustomBtn');
const homeBtn = document.getElementById('homeBtn');
const floatingBg = document.getElementById('floatingBg');
const customInput = document.getElementById('customInput');

let cards = [];
let selectedCards = [];
let isShuffled = false;
let maxSelection = 3; // Default

// --- View Logic ---
function showGame() {
    hideAllViews();
    gameView.classList.remove('hidden');
    initGame();
}

function showHome() {
    hideAllViews();
    homeView.classList.remove('hidden');
    createFloatingEmojis();
}

function showInput() {
    hideAllViews();
    inputView.classList.remove('hidden');
    customInput.value = ''; // Clear previous input
}

function hideAllViews() {
    homeView.classList.add('hidden');
    inputView.classList.add('hidden');
    gameView.classList.add('hidden');
}

// --- Custom Game Logic ---
function startDefaultGame() {
    currentFoods = [...defaultFoods];
    maxSelection = 3; // Default
    showGame();
}

function startCustomGame() {
    const text = customInput.value.trim();
    if (!text) {
        alert('메뉴를 입력해주세요!');
        return;
    }

    // Split by newlines or commas
    const rawList = text.split(/[\n,]+/).map(item => item.trim()).filter(item => item.length > 0);

    // Custom mode: allow even small lists
    if (rawList.length < 1) {
        alert('최소 1개 이상의 메뉴를 입력해주세요!');
        return;
    }

    // Create food objects
    const emojis = ['🍽️', '🥢', '🍴', '🥄', '🥡', '🍱', '🥣', '🥗', '🍖', '🍗', '🍔', '🍕'];
    currentFoods = rawList.map(name => ({
        name: name,
        emoji: emojis[Math.floor(Math.random() * emojis.length)] // Random default emoji
    }));

    maxSelection = 1; // Custom mode: 1 card only
    showGame();
}

// --- Background Animation ---
function createFloatingEmojis() {
    floatingBg.innerHTML = '';

    // Choose pool based on current context (default to defaultFoods for Home)
    const source = defaultFoods;
    const emojis = source.map(f => f.emoji);
    const count = 15;

    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.classList.add('floating-emoji');
        span.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 5 + Math.random() * 10;
        const size = 1.5 + Math.random() * 2;

        span.style.left = `${left}%`;
        span.style.animationDelay = `${delay}s`;
        span.style.animationDuration = `${duration}s`;
        span.style.fontSize = `${size}rem`;

        floatingBg.appendChild(span);
    }
}


// --- Game Logic ---
function initGame() {
    cardTable.innerHTML = '';
    cards = []; // Fix: Clear previous cards
    selectedCards = [];
    isShuffled = false;
    resultArea.classList.add('hidden');

    // Clear displayed results too
    const selectedFoodsDiv = document.getElementById('selectedFoods');
    if (selectedFoodsDiv) selectedFoodsDiv.innerHTML = '';

    shuffleBtn.disabled = false;
    shuffleBtn.textContent = '카드 섞기';

    if (gameInstruction) {
        gameInstruction.textContent = `카드를 섞고 ${maxSelection}개를 뽑아보세요!`;
    }

    // 카드 생성 (현재 currentFoods 사용)
    currentFoods.forEach((food, index) => {
        const card = createCard(food, index);
        cards.push(card);
        cardTable.appendChild(card);
    });
}

function createCard(food, index) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.index = index;

    const front = document.createElement('div');
    front.classList.add('card-face', 'card-front');
    front.textContent = '?';

    const back = document.createElement('div');
    back.classList.add('card-face', 'card-back');
    back.innerHTML = `
        <div class="food-emoji">${food.emoji}</div>
        <div class="food-name">${food.name}</div>
    `;

    card.appendChild(front);
    card.appendChild(back);

    card.addEventListener('click', () => handleCardClick(card));

    return card;
}

async function shuffleCards() {
    if (isShuffled) return;

    isShuffled = true;
    shuffleBtn.disabled = true;
    shuffleBtn.textContent = '섞는 중...';
    cardTable.classList.add('shuffling');

    for (let i = 0; i < 5; i++) {
        await playShuffleStep(250);
    }

    // 마무리
    cards.forEach(card => {
        card.style.transition = '';
    });

    cardTable.classList.remove('shuffling');
    shuffleBtn.textContent = `${maxSelection}개를 선택하세요!`;
}

function playShuffleStep(duration) {
    return new Promise(resolve => {
        const positions = new Map();
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            positions.set(card, { x: rect.left, y: rect.top });
        });

        cards.sort(() => Math.random() - 0.5);
        // DOM 재정렬
        cards.forEach(card => cardTable.appendChild(card));

        cards.forEach(card => {
            const oldPos = positions.get(card);
            const newRect = card.getBoundingClientRect();
            const deltaX = oldPos.x - newRect.left;
            const deltaY = oldPos.y - newRect.top;

            card.style.transition = 'none';
            card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });

        void cardTable.offsetHeight;

        cards.forEach(card => {
            card.style.transition = `transform ${duration}ms ease-in-out`;
            card.style.transform = '';
        });

        setTimeout(() => {
            resolve();
        }, duration);
    });
}

function handleCardClick(card) {
    if (!isShuffled) {
        alert("먼저 카드를 섞어주세요!");
        return;
    }

    if (selectedCards.includes(card)) return;

    if (selectedCards.length >= maxSelection) {
        alert(`이미 ${maxSelection}개를 다 뽑으셨습니다!`);
        return;
    }

    selectedCards.push(card);
    card.classList.add('selected');
    card.classList.add('flipped');

    updateResultArea(card);

    if (selectedCards.length === maxSelection) {
        shuffleBtn.textContent = '완료!';
    }
}

function updateResultArea(card) {
    const selectedFoodsDiv = document.getElementById('selectedFoods');

    if (selectedCards.length === 1) {
        resultArea.classList.remove('hidden');
        selectedFoodsDiv.innerHTML = '';
    }

    const index = card.dataset.index;
    const food = currentFoods[index]; // Use currentFoods!

    const foodItem = document.createElement('span');
    foodItem.className = 'result-item';
    foodItem.textContent = `${food.name} ${food.emoji}`;
    foodItem.style.margin = '0 10px';
    foodItem.style.fontSize = '1.5rem';
    foodItem.style.fontWeight = 'bold';
    foodItem.style.animation = 'fadeIn 0.5s ease-out';

    selectedFoodsDiv.appendChild(foodItem);
}

// Event Listeners
shuffleBtn.addEventListener('click', shuffleCards);
resetBtn.addEventListener('click', () => {
    selectedCards = [];
    cards = [];
    initGame(); // Re-init with currentFoods
});

startBtn.addEventListener('click', startDefaultGame);
customBtn.addEventListener('click', showInput);
inputBackBtn.addEventListener('click', showHome);
startGameCustomBtn.addEventListener('click', startCustomGame);
homeBtn.addEventListener('click', showHome);

// Initial Setup
createFloatingEmojis();
