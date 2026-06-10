const QUOTES = [

{quote:"Winter is coming.",speaker:"Ned Stark"},
{quote:"The man who passes the sentence should swing the sword.",speaker:"Ned Stark"},
{quote:"When you play the game of thrones, you win or you die.",speaker:"Cersei Lannister"},
{quote:"A Lannister always pays his debts.",speaker:"Tyrion Lannister"},
{quote:"I drink and I know things.",speaker:"Tyrion Lannister"},
{quote:"Never forget what you are. The rest of the world will not.",speaker:"Tyrion Lannister"},
{quote:"Chaos isn't a pit. Chaos is a ladder.",speaker:"Petyr Baelish"},
{quote:"Knowledge is power.",speaker:"Petyr Baelish"},
{quote:"Power is power.",speaker:"Cersei Lannister"},
{quote:"You know nothing, Jon Snow.",speaker:"Ygritte"},

{quote:"A girl has no name.",speaker:"Arya Stark"},
{quote:"What do we say to the God of Death?",speaker:"Syrio Forel"},
{quote:"Not today.",speaker:"Arya Stark"},
{quote:"The North remembers.",speaker:"Wyman Manderly"},
{quote:"Hold the door!",speaker:"Hodor"},
{quote:"The things I do for love.",speaker:"Jaime Lannister"},
{quote:"Love is the death of duty.",speaker:"Maester Aemon"},
{quote:"Kill the boy and let the man be born.",speaker:"Maester Aemon"},
{quote:"Any man who must say 'I am the king' is no true king.",speaker:"Tywin Lannister"},
{quote:"A lion doesn't concern himself with the opinions of sheep.",speaker:"Tywin Lannister"},

{quote:"Tell Cersei. I want her to know it was me.",speaker:"Olenna Tyrell"},
{quote:"The night is dark and full of terrors.",speaker:"Melisandre"},
{quote:"What is dead may never die.",speaker:"Balon Greyjoy"},
{quote:"The things we love destroy us every time.",speaker:"Jeor Mormont"},
{quote:"There is only one war that matters. The Great War.",speaker:"Jon Snow"},
{quote:"I am the dragon's daughter.",speaker:"Daenerys Targaryen"},
{quote:"Dracarys.",speaker:"Daenerys Targaryen"},
{quote:"I will take what is mine with fire and blood.",speaker:"Daenerys Targaryen"},
{quote:"A mind needs books like a sword needs a whetstone.",speaker:"Tyrion Lannister"},
{quote:"Every flight begins with a fall.",speaker:"George R.R. Martin"},

{quote:"The freedom to make my own mistakes was all I ever wanted.",speaker:"Mance Rayder"},
{quote:"Nothing burns like the cold.",speaker:"George R.R. Martin"},
{quote:"A very small man can cast a very large shadow.",speaker:"Varys"},
{quote:"The realm needs a good ruler.",speaker:"Varys"},
{quote:"Leave one wolf alive and the sheep are never safe.",speaker:"Arya Stark"},
{quote:"The lone wolf dies but the pack survives.",speaker:"Sansa Stark"},
{quote:"No one can protect me. No one can protect anyone.",speaker:"Sansa Stark"},
{quote:"There's no cure for being a c***.",speaker:"Bronn"},
{quote:"Lots of people name their swords.",speaker:"The Hound"},
{quote:"That's because lots of c***s.",speaker:"The Hound"},

{quote:"A ruler who kills those devoted to her is not a ruler who inspires devotion.",speaker:"Tyrion Lannister"},
{quote:"Everyone is mine to torment.",speaker:"Joffrey Baratheon"},
{quote:"The king can do as he likes.",speaker:"Joffrey Baratheon"},
{quote:"The North is hard and cold and has no mercy.",speaker:"Roose Bolton"},
{quote:"If you think this has a happy ending, you haven't been paying attention.",speaker:"Ramsay Bolton"},
{quote:"There is no middle ground.",speaker:"Stannis Baratheon"},
{quote:"The Iron Throne is mine by right.",speaker:"Stannis Baratheon"},
{quote:"I have always had blue eyes.",speaker:"The Night King"},
{quote:"The true enemy won't wait out the storm.",speaker:"Jon Snow"},
{quote:"Sometimes duty is the death of love.",speaker:"Jon Snow"}

];
let gameQuestions = [];
let currentQuestion = 0;
let score = 0;

function generateQuestion(questionData)
{
    const correctAnswer = questionData.speaker;

    const allSpeakers =
        [...new Set(QUOTES.map(q => q.speaker))];

    const wrongAnswers =
        allSpeakers
        .filter(name => name !== correctAnswer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    const options =
        [correctAnswer, ...wrongAnswers]
        .sort(() => Math.random() - 0.5);

    return {
        quote: questionData.quote,
        correct: correctAnswer,
        options: options
    };
}

function startQuizMode()
{
    currentQuestion = 0;
    score = 0;

    gameQuestions =
        [...QUOTES]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map(generateQuestion);

    document.getElementById("home-screen")
        .classList.add("hidden");

    document.getElementById("quiz-screen")
        .classList.remove("hidden");

    showQuestion();
}

function showQuestion()
{
    const q = gameQuestions[currentQuestion];

    document.getElementById("quiz-progress")
        .innerText =
        `Question ${currentQuestion + 1} / 10`;

    document.getElementById("quote-text")
        .innerText =
        `"${q.quote}"`;

    const optionsContainer =
        document.getElementById("quiz-options");

    optionsContainer.innerHTML = "";

    q.options.forEach(option =>
    {
        const btn =
            document.createElement("button");

        btn.className =
            "quiz-option";

        btn.innerText =
            option;

        btn.onclick =
            () => answerQuestion(btn, q);

        optionsContainer.appendChild(btn);
    });
}

function answerQuestion(clickedBtn, question)
{
    const buttons =
        document.querySelectorAll(".quiz-option");

    buttons.forEach(btn =>
    {
        btn.disabled = true;

        if(btn.innerText === question.correct)
        {
            btn.classList.add("correct");
        }
    });

    if(clickedBtn.innerText === question.correct)
    {
        score++;
    }
    else
    {
        clickedBtn.classList.add("wrong");
    }

    setTimeout(() =>
    {
        currentQuestion++;

        if(currentQuestion >= gameQuestions.length)
        {
            showQuizResults();
        }
        else
        {
            showQuestion();
        }

    }, 1800);
}

function showQuizResults()
{
    document
        .getElementById("quiz-screen")
        .classList.add("hidden");

    document
        .getElementById("quiz-result-screen")
        .classList.remove("hidden");

    let title = "";
    let message = "";

    if(score === 10)
    {
        title = "👑 Hand of the King";
        message =
        "The maesters bow before your knowledge.";
    }
    else if(score >= 8)
    {
        title = "⚔️ Lord Commander";
        message =
        "A true scholar of Westeros.";
    }
    else if(score >= 6)
    {
        title = "🦁 Noble Lord";
        message =
        "You know your houses well.";
    }
    else if(score >= 4)
    {
        title = "🍷 Tavern Storyteller";
        message =
        "You remember some tales, but not all.";
    }
    else
    {
        title = "💀 Burned by Drogon";
        message =
        "The ravens brought bad news today.";
    }

    document
        .getElementById("quiz-score")
        .innerHTML =
        `
        <h1>${score}/10</h1>
        <h2>${title}</h2>
        <p>${message}</p>
        `;
}

// =====================================
// START QUIZ
// =====================================

document
.getElementById("quote-mode-btn")
.addEventListener("click", startQuizMode);

// =====================================
// PLAY AGAIN
// =====================================

document
.getElementById("play-quiz-again")
.addEventListener("click", () =>
{
    document
    .getElementById("quiz-result-screen")
    .classList.add("hidden");

    document
    .getElementById("quiz-screen")
    .classList.remove("hidden");

    startQuizMode();
});

// =====================================
// BACK FROM QUIZ
// =====================================

document
.getElementById("back-from-quiz")
.addEventListener("click", () =>
{
    document
    .getElementById("quiz-screen")
    .classList.add("hidden");

    document
    .getElementById("home-screen")
    .classList.remove("hidden");
});

// =====================================
// BACK FROM RESULTS
// =====================================

document
.getElementById("back-from-quiz-results")
.addEventListener("click", () =>
{
    document
    .getElementById("quiz-result-screen")
    .classList.add("hidden");

    document
    .getElementById("home-screen")
    .classList.remove("hidden");
});