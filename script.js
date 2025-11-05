let userName = '';
let currentBranch = '';
let currentQuestionIndex = 0;
let answers = [];
let confidence = 50;
let recommendedShow = null;
let systemConfidence = 0;

const screens = {
    start: document.getElementById('startScreen'),
    questions: document.getElementById('questionsScreen'),
    result: document.getElementById('resultScreen')
};

const elements = {
    userNameInput: document.getElementById('userName'),
    startBtn: document.getElementById('startBtn'),
    exitBtn: document.getElementById('exitBtn'),
    restartBtn: document.getElementById('restartBtn'),
    questionCounter: document.getElementById('questionCounter'),
    questionText: document.getElementById('questionText'),
    confidenceSlider: document.getElementById('confidenceSlider'),
    confidenceValue: document.getElementById('confidenceValue'),
    optionsGrid: document.getElementById('optionsGrid'),
    resultGreeting: document.getElementById('resultGreeting'),
    showTitle: document.getElementById('showTitle'),
    showDetails: document.getElementById('showDetails'),
    showDescription: document.getElementById('showDescription'),
    answersList: document.getElementById('answersList')
};

elements.startBtn.addEventListener('click', handleStart);
elements.exitBtn.addEventListener('click', handleExit);
elements.restartBtn.addEventListener('click', handleExit);
elements.confidenceSlider.addEventListener('input', handleConfidenceChange);

function handleStart() {
    const name = elements.userNameInput.value.trim();
    if (name) {
        userName = name;
        showScreen('questions');
        showRootQuestion();
    }
}

function handleExit() {
    userName = '';
    currentBranch = '';
    currentQuestionIndex = 0;
    answers = [];
    confidence = 50;
    recommendedShow = null;

    elements.userNameInput.value = '';
    elements.confidenceSlider.value = 50;
    elements.confidenceValue.textContent = '50%';

    showScreen('start');
}

function handleConfidenceChange() {
    confidence = parseInt(elements.confidenceSlider.value);
    elements.confidenceValue.textContent = confidence + '%';
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    screens[screenName].classList.add('active');
}

function showRootQuestion() {
    currentBranch = '';
    currentQuestionIndex = 0;
    elements.questionCounter.textContent = 'Выберите тему';
    elements.questionText.textContent = knowledgeBase.questions.root.text;
    elements.confidenceSlider.style.display = 'none';
    elements.confidenceValue.parentElement.style.display = 'none';

    elements.optionsGrid.innerHTML = '';

    knowledgeBase.questions.root.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option.label;
        button.addEventListener('click', () => handleRootAnswer(option.id));
        elements.optionsGrid.appendChild(button);
    });
}

function showQuestion() {
    const questions = knowledgeBase.questions[currentBranch];
    const currentQ = questions[currentQuestionIndex];

    elements.questionCounter.textContent = `Вопрос ${currentQ.id}`;
    elements.questionText.textContent = currentQ.text;
    elements.confidenceSlider.style.display = 'block';
    elements.confidenceValue.parentElement.style.display = 'flex';
    elements.confidenceSlider.value = confidence;
    elements.confidenceValue.textContent = confidence + '%';

    elements.optionsGrid.innerHTML = '';

    currentQ.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.addEventListener('click', () => handleAnswer(option));
        elements.optionsGrid.appendChild(button);
    });
}

function handleRootAnswer(branch) {
    currentBranch = branch;
    currentQuestionIndex = 0;
    showQuestion();
}

function handleAnswer(answer) {
    const currentQuestions = knowledgeBase.questions[currentBranch];
    const currentQ = currentQuestions[currentQuestionIndex];

    answers.push({
        questionId: currentQ.id,
        questionText: currentQ.text,
        answer: answer,
        confidence: confidence
    });

    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        confidence = 50;
        showQuestion();
    } else {
        findRecommendation();
        showResult();
    }
}

function findRecommendation() {
    const path = answers.map(a => a.answer);
    const recommendations = knowledgeBase.recommendations[currentBranch];
    recommendedShow = recommendations[0].show;
    let matchCounter = 0;
    let matchCounterMax = -1;
    for (let i = 0; i < recommendations.length; i++) {
        matchCounter = 0;
        for (let j = 0; j < path.length; j++) {
            if (path[j] === recommendations[i].path[j]) {
                matchCounter++;
            }
        }
        if (matchCounter > matchCounterMax) {
            systemConfidence = matchCounter * 20;
            recommendedShow = recommendations[i].show;
            matchCounterMax = matchCounter;
        }
    }
}

function showResult() {
    elements.resultGreeting.textContent = `${userName},`;

    elements.showTitle.textContent = recommendedShow.title;

    elements.showDetails.innerHTML = `
                <div class="detail-item">
                    <span>Уверенность выбора: ${systemConfidence}%</span>
                </div>
                <div class="detail-item">
                    <span>Рейтинг Кинопоиска: ${recommendedShow.rating}</span>
                </div>
                <div class="detail-item">
                    <span>Сезонов: ${recommendedShow.seasons}</span>
                </div>
                <div class="detail-item">
                    <span>Серий: ${recommendedShow.episodes}</span>
                </div>
            `;

    elements.showDescription.textContent = recommendedShow.description;

    elements.answersList.innerHTML = '';
    answers.forEach((answer, index) => {
        const answerItem = document.createElement('div');
        answerItem.className = 'answer-item';
        answerItem.innerHTML = `
                    <div class="answer-question">Вопрос ${index + 1}: ${answer.questionText}</div>
                    <div class="answer-text">Ответ: ${answer.answer}</div>
                    <div class="answer-confidence">
                        <span>Уверенность</span>
                        <span class="confidence-percent">${answer.confidence}%</span>
                    </div>
                `;
        elements.answersList.appendChild(answerItem);
    });

    showScreen('result');
}

