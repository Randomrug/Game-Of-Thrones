// ======================== ROYAL SORTER ENGINE (FIXED BATTLE COUNT & FINAL) ========================
let currentQuizType = null;     // 'character' or 'animal'
let activeItems = [];
let comparisonCount = 0;
let maxComparisons = 0;
let currentLeft = null, currentRight = null;

// Core data structures
let wins = new Map();
let losses = new Map();
let battleHistory = [];
let pairBattles = new Map();
let characterBattleCount = new Map();

let phase = "initial";
let mandatoryPairs = [];
let mandatoryIndex = 0;

// Animal tournament state
let animalTournamentWinner = null;
let animalCurrentRoundParticipants = [];
let animalNextRoundParticipants = [];
let animalRoundMatches = [];
let animalCurrentMatchIndex = 0;
let animalRoundBye = null;
let animalCurrentRoundLabel = "";
let animalRoundNumber = 0;

// ----- Helper Functions -----
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getBattleKey(id1, id2) {
    return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
}

// ----- Animal Tournament Helpers -----
function createTournamentMatches(participants) {
    let matches = [];
    let bye = null;
    for (let i = 0; i + 1 < participants.length; i += 2) {
        matches.push({ left: participants[i], right: participants[i + 1] });
    }
    if (participants.length % 2 === 1) {
        bye = participants[participants.length - 1];
    }
    return { matches, bye };
}

function getAnimalRoundLabel(length) {
    if (length <= 2) return "⚔️ FINAL BATTLE ⚔️";
    if (length <= 4) return "🏆 SEMI-FINALS 🏆";
    return `🐉 ROUND ${animalRoundNumber} 🐉`;
}

function startAnimalRound() {
    let { matches, bye } = createTournamentMatches(animalCurrentRoundParticipants);
    animalRoundMatches = matches;
    animalRoundBye = bye;
    animalCurrentMatchIndex = 0;
    animalCurrentRoundLabel = getAnimalRoundLabel(animalCurrentRoundParticipants.length);
    animalRoundNumber++;
    if (animalRoundBye) {
        animalNextRoundParticipants = [animalRoundBye];
    } else {
        animalNextRoundParticipants = [];
    }
    document.getElementById("battle-info").innerHTML = `${animalCurrentRoundLabel} · ${animalRoundMatches.length} battle${animalRoundMatches.length === 1 ? "" : "s"}`;
}

function initAnimalTournament(participants) {
    animalTournamentWinner = null;
    animalRoundNumber = 1;
    animalCurrentRoundParticipants = [...participants];
    animalNextRoundParticipants = [];
    startAnimalRound();
}

function advanceAnimalTournament(winner) {
    animalNextRoundParticipants.push(winner);
    animalCurrentMatchIndex++;
    if (animalCurrentMatchIndex >= animalRoundMatches.length) {
        if (animalNextRoundParticipants.length === 1) {
            animalTournamentWinner = animalNextRoundParticipants[0];
        } else {
            animalCurrentRoundParticipants = [...animalNextRoundParticipants];
            animalNextRoundParticipants = [];
            startAnimalRound();
        }
    }
}

// ----- Transitive Graph (character mode) -----
function getTransitiveWins(itemId, visited = new Set(), depth = 0) {
    if (depth > 50 || visited.has(itemId)) return 0;
    visited.add(itemId);
    let total = 0;
    let directWins = wins.get(itemId) || new Set();
    for (let beatenId of directWins) {
        total++;
        total += getTransitiveWins(beatenId, visited, depth + 1);
    }
    return total;
}

function updateGraph(winner, loser) {
    wins.get(winner.id).add(loser.id);
    losses.get(loser.id).add(winner.id);

    let loserWins = wins.get(loser.id) || new Set();
    for (let transLoser of loserWins) {
        if (transLoser !== winner.id) {
            wins.get(winner.id).add(transLoser);
            losses.get(transLoser).add(winner.id);
        }
    }
    let winnerLosses = losses.get(winner.id) || new Set();
    for (let transWinner of winnerLosses) {
        if (transWinner !== loser.id) {
            wins.get(transWinner).add(loser.id);
            losses.get(loser.id).add(transWinner);
        }
    }
    let changed = true;
    let iter = 0;
    while (changed && iter < 10) {
        changed = false;
        for (let [id, beatSet] of wins) {
            let newBeats = new Set(beatSet);
            for (let beaten of beatSet) {
                let deeper = wins.get(beaten) || new Set();
                for (let d of deeper) {
                    if (d !== id && !newBeats.has(d)) {
                        newBeats.add(d);
                        losses.get(d).add(id);
                        changed = true;
                    }
                }
            }
            wins.set(id, newBeats);
        }
        iter++;
    }
}

function getCurrentRanking() {
    // Scoring that mixes transitive evidence with direct battle performance
    let scores = new Map();
    for (let item of activeItems) {
        const trans = getTransitiveWins(item.id);
        const directWins = battleHistory.filter(b => b.winner === item.id).length;
        const directLosses = battleHistory.filter(b => b.loser === item.id).length;
        const winRate = (directWins + directLosses) > 0 ? (directWins / (directWins + directLosses)) : 0;

        // weights chosen to emphasize transitive reach, then actual wins, then win-rate refinement
        const score = trans + (directWins * 8) + (winRate * 30);
        scores.set(item.id, score);
    }

    return [...activeItems].sort((a, b) => {
        let scA = scores.get(a.id) || 0;
        let scB = scores.get(b.id) || 0;
        if (scA !== scB) return scB - scA;
        let wA = wins.get(a.id)?.size || 0;
        let wB = wins.get(b.id)?.size || 0;
        return wB - wA;
    });
}

// ----- Uncertainty helpers -----
function isUncertainPair(a, b) {
    const key = getBattleKey(a.id, b.id);
    if ((pairBattles.get(key) || 0) > 0) return false; // already fought
    const aBeatsB = wins.get(a.id)?.has(b.id);
    const bBeatsA = wins.get(b.id)?.has(a.id);
    if (aBeatsB || bBeatsA) return false; // direct evidence exists
    const scoreDiff = Math.abs(getTransitiveWins(a.id) - getTransitiveWins(b.id));
    // treat small transitive-score differences as uncertain; threshold is adaptive to roster size
    const threshold = Math.max(2, Math.ceil(activeItems.length * 0.06));
    return scoreDiff <= threshold;
}

function getConfidence(itemId) {
    let battleCnt = characterBattleCount.get(itemId) || 0;
    let transWins = getTransitiveWins(itemId);
    let total = activeItems.length;
    let battleConf = Math.min(60, battleCnt * 7);
    let transConf = Math.min(35, (transWins / total) * 35);
    let directWins = wins.get(itemId)?.size || 0;
    let directLoss = losses.get(itemId)?.size || 0;
    let ratioBonus = (directWins + directLoss) > 0 ? (directWins / (directWins + directLoss)) * 5 : 0;
    return Math.min(98, battleConf + transConf + ratioBonus);
}

function buildMandatoryBattles() {
    // Build mandatory battles by (1) validating under-tested top candidates,
    // (2) preferring uncertain pairs among the top-ranked items, then
    // (3) falling back to the previous conservative approach.
    let ranked = getCurrentRanking();
    let topCount = (activeItems.length <= 20 ? 12 : (activeItems.length <= 50 ? 18 : 22));
    topCount = Math.min(topCount, ranked.length);
    let topItems = ranked.slice(0, topCount);
    let battles = [];

    // 1) Validation: ensure Top 10 have >=10 battles, Top 20 have >=8 battles
    for (let idx = 0; idx < topItems.length; idx++) {
        let item = topItems[idx];
        let current = characterBattleCount.get(item.id) || 0;
        let required = 0;
        if (idx < 10) required = 10;
        else if (idx < 20) required = 8;
        if (required > 0 && current < required) {
            // Find best candidates among topItems to validate against
            let candidates = topItems.filter(c => c.id !== item.id);
            candidates.sort((c1, c2) => {
                let k1 = pairBattles.get(getBattleKey(item.id, c1.id)) || 0;
                let k2 = pairBattles.get(getBattleKey(item.id, c2.id)) || 0;
                if (k1 !== k2) return k1 - k2;
                let d1 = Math.abs(getTransitiveWins(item.id) - getTransitiveWins(c1.id));
                let d2 = Math.abs(getTransitiveWins(item.id) - getTransitiveWins(c2.id));
                return d1 - d2;
            });
            let need = required - current;
            for (let cand of candidates) {
                if (need <= 0) break;
                let key = getBattleKey(item.id, cand.id);
                let fought = pairBattles.get(key) || 0;
                if (fought >= 2) continue; // prefer not to over-repeat a pair
                battles.push({ left: item, right: cand, priority: fought === 0 ? 3 : 2 });
                need--;
            }
        }
    }

    // 2) Uncertainty-driven pairs among top items
    for (let i = 0; i < topItems.length; i++) {
        for (let j = i+1; j < topItems.length; j++) {
            let a = topItems[i], b = topItems[j];
            let key = getBattleKey(a.id, b.id);
            let fought = pairBattles.get(key) || 0;
            if (fought === 0 && isUncertainPair(a, b)) {
                battles.push({ left: a, right: b, priority: 2 });
            }
        }
    }

    // 3) Fallback: original conservative top-item confirmations
    if (battles.length === 0) {
        for (let i = 0; i < topItems.length; i++) {
            for (let j = i+1; j < topItems.length; j++) {
                let key = getBattleKey(topItems[i].id, topItems[j].id);
                let fought = pairBattles.get(key) || 0;
                if (fought < 2) {
                    battles.push({ left: topItems[i], right: topItems[j], priority: fought === 0 ? 2 : 1 });
                }
            }
        }
    }

    // Remove duplicate pairs (same key) keeping highest priority
    let dedup = new Map();
    for (let b of battles) {
        let k = getBattleKey(b.left.id, b.right.id);
        if (!dedup.has(k) || (dedup.get(k).priority < b.priority)) dedup.set(k, b);
    }
    let out = Array.from(dedup.values());
    out.sort((a,b) => b.priority - a.priority);
    return out;
}

// ----- Battle Selection (unified) -----
function getNextBattle() {
    if (currentQuizType === 'animal') {
        if (animalTournamentWinner) return null;
        if (animalCurrentMatchIndex < animalRoundMatches.length) return animalRoundMatches[animalCurrentMatchIndex];
        return null;
    }

    // CHARACTER MODE
    if (phase === "initial") {
        let low = activeItems.filter(it => (characterBattleCount.get(it.id)||0) < 3);
        if (low.length >= 2) {
            let a = low[Math.floor(Math.random() * low.length)];
            let b = low[Math.floor(Math.random() * low.length)];
            while (a.id === b.id && low.length>1) b = low[Math.floor(Math.random() * low.length)];
            if (a.id !== b.id) return { left: a, right: b };
        } else if (low.length === 1) {
            let a = low[0];
            let candidates = activeItems.filter(c => c.id !== a.id);
            candidates.sort((c1,c2) => (pairBattles.get(getBattleKey(a.id,c1.id))||0) - (pairBattles.get(getBattleKey(a.id,c2.id))||0));
            if (candidates.length) return { left: a, right: candidates[0] };
        }
        phase = "mandatory";
        mandatoryPairs = buildMandatoryBattles();
        mandatoryIndex = 0;
    }
    if (phase === "mandatory") {
        if (mandatoryIndex >= mandatoryPairs.length || mandatoryPairs.length === 0) {
            mandatoryPairs = buildMandatoryBattles();
            mandatoryIndex = 0;
        }
        if (mandatoryIndex < mandatoryPairs.length) {
            let battle = mandatoryPairs[mandatoryIndex++];
            let battleType = battle.priority === 2 ? "⭐ FIRST TIME BATTLE ⭐" : "🔄 CONFIRMATION BATTLE 🔄";
            document.getElementById("battle-info").innerHTML = battleType;
            return { left: battle.left, right: battle.right };
        }
        phase = "final";
    }
    if (phase === "final") {
        let ranked = getCurrentRanking();
        let topN = Math.min(20, ranked.length);
        for (let i=0; i<topN; i++) {
            for (let j=i+1; j<topN; j++) {
                let key = getBattleKey(ranked[i].id, ranked[j].id);
                if ((pairBattles.get(key)||0) < 2) return { left: ranked[i], right: ranked[j] };
            }
        }
        let a = activeItems[Math.floor(Math.random() * activeItems.length)];
        let b = activeItems[Math.floor(Math.random() * activeItems.length)];
        while (a.id === b.id) b = activeItems[Math.floor(Math.random() * activeItems.length)];
        return { left: a, right: b };
    }
    return { left: activeItems[0], right: activeItems[1] };
}

// ----- User Choice -----
function choose(winner, loser) {
    comparisonCount++;
    let key = getBattleKey(winner.id, loser.id);
    pairBattles.set(key, (pairBattles.get(key)||0) + 1);
    characterBattleCount.set(winner.id, (characterBattleCount.get(winner.id)||0)+1);
    characterBattleCount.set(loser.id, (characterBattleCount.get(loser.id)||0)+1);
    battleHistory.push({ winner: winner.id, loser: loser.id });
    updateGraph(winner, loser);

    if (currentQuizType === 'animal') {
        advanceAnimalTournament(winner);
        if (animalTournamentWinner) {
            showResults();
            return;
        }
    }
    nextBattle();
}

function nextBattle() {
    if (currentQuizType === 'character' && comparisonCount >= maxComparisons) {
        showResults();
        return;
    }
    if (currentQuizType === 'animal' && animalTournamentWinner) {
        showResults();
        return;
    }
    updateProgressDisplay();
    let battle = getNextBattle();
    if (!battle) {
        showResults();
        return;
    }
    currentLeft = battle.left;
    currentRight = battle.right;
    let battleContainer = document.querySelector(".battle-container");
    if (currentQuizType === 'animal') {
        battleContainer.classList.add('animal-battle-container');
    } else {
        battleContainer.classList.remove('animal-battle-container');
    }
    renderCard("left-card", currentLeft, () => choose(currentLeft, currentRight));
    renderCard("right-card", currentRight, () => choose(currentRight, currentLeft));
}

function renderCard(elId, item, callback) {
    const cardDiv = document.getElementById(elId);
    let transitive = getTransitiveWins(item.id);
    let battles = characterBattleCount.get(item.id)||0;
    let isAnimal = currentQuizType === 'animal';
    let imgSrc = item.image || (isAnimal ? "creatures/placeholder.jpg" : "images/placeholder.jpg");
    cardDiv.innerHTML = `
        <div class="card-inner">
            <img src="${imgSrc}" alt="${item.name}" onerror="this.src='${isAnimal ? 'creatures/placeholder.jpg' : 'images/placeholder.jpg'}'">
            <h3>${item.name}</h3>
            <div class="card-stats">
                <span>🏆 ${transitive}</span>
                <span>⚔️ ${battles}</span>
            </div>
        </div>
    `;
    cardDiv.onclick = callback;
}

function updateProgressDisplay() {
    let percent = 0;
    let phaseText = "";
    if (currentQuizType === 'animal') {
        if (animalTournamentWinner) {
            phaseText = "🏁 Tournament complete!";
            percent = 100;
        } else {
            let total = animalRoundMatches.length;
            let done = animalCurrentMatchIndex;
            percent = total ? Math.round((done / total) * 100) : 0;
            let matchInfo = `${done}/${total} battles`;
            if (animalRoundBye) matchInfo += ` · 1 bye advances`;
            phaseText = `${animalCurrentRoundLabel} · ${matchInfo}`;
        }
    } else {
        percent = Math.round((comparisonCount / maxComparisons) * 100);
        phaseText = phase === "initial" ? "📜 Initial Battles (each character appears 3 times)" :
                    (phase === "mandatory" ? `⚔️ Mandatory Top Contender Battles (${mandatoryPairs.length - mandatoryIndex} left)` : "🏁 Final Phase");
    }
    document.getElementById("progress").innerHTML = `
        <div>${phaseText}</div>
        <div class="progress-bar"><div class="progress-fill" style="width: ${percent}%"></div></div>
    `;
}

// ----- Results Display (Character Podium + Animal) -----
function showResults() {
    document.getElementById("sort-screen").classList.add("hidden");
    document.getElementById("result-screen").classList.remove("hidden");
    let isAnimal = (currentQuizType === 'animal');
    let html = '';
    if (isAnimal) {
        let top = animalTournamentWinner || activeItems[0];
        let archetype = top.archetype || "Legendary Companion";
        let traits = top.traits ? (Array.isArray(top.traits) ? top.traits.join(', ') : top.traits) : "Fearless, loyal, instinctive";
        let strengths = top.strengths ? (Array.isArray(top.strengths) ? top.strengths.join(', ') : top.strengths) : "Power, instinct, loyalty";
        let weaknesses = top.weaknesses ? (Array.isArray(top.weaknesses) ? top.weaknesses.join(', ') : top.weaknesses) : "Stubborn, intense";
        let interpretation = top.personality || top.description || "Your spirit creature reveals your core.";
        html = `
            <div class="animal-winner-section">
                <img src="${top.image}" class="animal-winner-image" onerror="this.src='creatures/placeholder.jpg'">
                <div class="animal-winner-name">${top.name}</div>
                <div class="animal-winner-overlay"></div>
                <div class="animal-winner-info">
                    <div class="animal-winner-title">🐾 Your Spirit Creature</div>
                    <h2>${top.name}</h2>
                    <div class="animal-stats-banner">
                        <div class="animal-stat"><div class="animal-stat-value">${top.owner || 'Unknown'}</div><div class="animal-stat-label">Owner</div></div>
                        <div class="animal-stat"><div class="animal-stat-value">${top.type || 'Creature'}</div><div class="animal-stat-label">Type</div></div>
                        <div class="animal-stat"><div class="animal-stat-value">${animalRoundNumber-1} Rounds</div><div class="animal-stat-label">Journey</div></div>
                    </div>
                </div>
            </div>
            <div class="animal-personality-reveal">
                <h3>${archetype}</h3>
                <p><strong>Description:</strong> ${top.description || 'A creature of legend.'}</p>
                <p><strong>Personality:</strong> ${interpretation}</p>
                <p><strong>Traits:</strong> ${traits}</p>
                <p><strong>Strengths:</strong> ${strengths}</p>
                <p><strong>Weaknesses:</strong> ${weaknesses}</p>
            </div>
        `;
    } else {
        let ranked = getCurrentRanking();
        let showCount = Math.min(activeItems.length <=20 ? 20 : (activeItems.length<=50?50:102), ranked.length);
        let top3 = ranked.slice(0,3);
        html = `<div class="results-header"><h2>🏆 YOUR SMALL COUNCIL</h2><p>After ${comparisonCount} duels · ${pairBattles.size} unique bonds</p></div>`;
        if (top3.length) {
            html += `<div class="podium-container">`;
            let gold = top3[0];
            html += `<div class="podium-card gold"><div class="crown-icon">👑</div><div class="podium-medal">🥇</div><img src="${gold.image}" class="podium-img" onerror="this.src='images/placeholder.jpg'"><div class="podium-name">${gold.name}</div><div class="podium-stats"><span>${battleHistory.filter(b=>b.winner===gold.id).length}-${battleHistory.filter(b=>b.loser===gold.id).length}</span><span>🏆${getTransitiveWins(gold.id)}</span><span>${Math.round(getConfidence(gold.id))}%</span></div></div>`;
            if (top3[1]) {
                let silver = top3[1];
                html += `<div class="podium-card silver"><div class="podium-medal">🥈</div><img src="${silver.image}" class="podium-img" onerror="this.src='images/placeholder.jpg'"><div class="podium-name">${silver.name}</div><div class="podium-stats"><span>${battleHistory.filter(b=>b.winner===silver.id).length}-${battleHistory.filter(b=>b.loser===silver.id).length}</span><span>🏆${getTransitiveWins(silver.id)}</span><span>${Math.round(getConfidence(silver.id))}%</span></div></div>`;
            }
            if (top3[2]) {
                let bronze = top3[2];
                html += `<div class="podium-card bronze"><div class="podium-medal">🥉</div><img src="${bronze.image}" class="podium-img" onerror="this.src='images/placeholder.jpg'"><div class="podium-name">${bronze.name}</div><div class="podium-stats"><span>${battleHistory.filter(b=>b.winner===bronze.id).length}-${battleHistory.filter(b=>b.loser===bronze.id).length}</span><span>🏆${getTransitiveWins(bronze.id)}</span><span>${Math.round(getConfidence(bronze.id))}%</span></div></div>`;
            }
            html += `</div>`;
        }
        html += `<div class="full-ranking"><h3>📜 The Complete Lineage</h3>`;
        for (let i=0; i<showCount; i++) {
            let it = ranked[i];
            let rankSign = i===0?"🥇":(i===1?"🥈":(i===2?"🥉":`#${i+1}`));
            html += `<div class="ranking-item"><div style="width:60px;">${rankSign}</div><div class="rank-avatar"><img src="${it.image}" onerror="this.src='images/placeholder.jpg'"></div><div class="rank-name">${it.name}</div><div class="rank-stats"><span>${battleHistory.filter(b=>b.winner===it.id).length}-${battleHistory.filter(b=>b.loser===it.id).length}</span><span>🏆${getTransitiveWins(it.id)}</span><span>${Math.round(getConfidence(it.id))}%</span></div></div>`;
        }
        html += `</div><div class="personality-box"><span>🏆 Your ultimate champion: ${ranked[0].name}. May your reign be wise.</span></div>`;
    }
    document.getElementById("results-container").innerHTML = html;
    setRandomQuote("result-quote");
}

// ----- Start Quiz -----
async function startQuiz(type, itemsArray, maxBattles) {
    currentQuizType = type;
    activeItems = shuffleArray([...itemsArray]);
    comparisonCount = 0;
    wins.clear(); losses.clear(); battleHistory = []; pairBattles.clear(); characterBattleCount.clear();
    mandatoryPairs = []; mandatoryIndex = 0; phase = "initial";
    activeItems.forEach(it => {
        wins.set(it.id, new Set());
        losses.set(it.id, new Set());
        characterBattleCount.set(it.id, 0);
    });
    if (type === 'animal') {
        initAnimalTournament(activeItems);
    } else {
        maxComparisons = maxBattles;
    }
    document.getElementById("battle-question").innerText = type === 'character' ? "Whom would you stand beside when winter comes?" : "Which creature calls to you?";
    // Show a curated GoT line in character mode's battle-info (keeps animal rounds exclusive)
    if (type !== 'animal') setBattleInfoQuote();
    document.getElementById("sort-screen").classList.remove("hidden");
    document.getElementById("home-screen").classList.add("hidden");
    document.getElementById("submode-screen").classList.add("hidden");
    document.getElementById("result-screen").classList.add("hidden");
    setRandomQuote("battle-quote");
    nextBattle();
}

// ----- Data Loading & UI Navigation -----
let allCharactersData = [];
let allCreaturesData = [];

async function loadData() {
    try {
        const charRes = await fetch("Json/characters.json");
        let chars = await charRes.json();
        chars.forEach(c => {
            if (c.image) {
                let img = c.image.replace(/^\/images\//, "");
                if (!img.startsWith("images/")) img = "images/" + img;
                c.image = img;
            } else c.image = "images/placeholder.jpg";
        });
        allCharactersData = chars;
        const creatureRes = await fetch("Json/creatures.json");
        let creatures = await creatureRes.json();
        creatures.forEach(cr => {
            if (cr.image) {
                let img = cr.image.replace(/^\/animals\//, "").replace(/^animals\//, "");
                if (!img.startsWith("creatures/")) img = "creatures/" + img;
                cr.image = img;
            } else cr.image = "creatures/placeholder.jpg";
        });
        allCreaturesData = creatures;
    } catch(e) { console.error(e); }
}

const quotes = [
    "“Winter is coming.” – House Stark",
    "“Not today.” – Arya Stark",
    "“A girl has no name.” – Arya Stark",
    "“Leave one wolf alive and the sheep are never safe.” – Arya Stark",
    "“The North remembers.” – Wyman Manderly",
    "“The lone wolf dies, but the pack survives.” – Sansa Stark",
    "“When enough people make false promises, words stop meaning anything.” – Jon Snow",
    "“The things I do for love.” – Jaime Lannister",
    "“I drink and I know things.” – Tyrion Lannister",
    "“Never forget what you are.” – Tyrion Lannister",
    "“A mind needs books like a sword needs a whetstone.” – Tyrion Lannister",
    "“That's what I do. I drink and I know things.” – Tyrion Lannister",
    "“Power resides where men believe it resides.” – Varys",
    "“Chaos isn't a pit. Chaos is a ladder.” – Littlefinger",
    "“Knowledge is power.” – Littlefinger",
    "“Power is power.” – Cersei Lannister",
    "“When you play the game of thrones, you win or you die.” – Cersei Lannister",
    "“Every flight begins with a fall.” – George R. R. Martin",
    "“A Lannister always pays his debts.” – House Lannister",
    "“Any man who must say 'I am the king' is no true king.” – Tywin Lannister",
    "“The lion does not concern himself with the opinion of sheep.” – Tywin Lannister",
    "“Explain to me why it is more noble to kill ten thousand men in battle than a dozen at dinner.” – Tywin Lannister",
    "“Tell Cersei. I want her to know it was me.” – Olenna Tyrell",
    "“The world is overflowing with horrible things, but they're all a tray of cakes next to death.” – Olenna Tyrell",
    "“You know nothing, Jon Snow.” – Ygritte",
    "“The freedom to make my own mistakes was all I ever wanted.” – Mance Rayder",
    "“The night is dark and full of terrors.” – Melisandre",
    "“What is dead may never die.” – House Greyjoy",
    "“A dragon is not a slave.” – Daenerys Targaryen",
    "“Dracarys.” – Daenerys Targaryen",
    "“I will take what is mine with fire and blood.” – Daenerys Targaryen",
    "“Hold the door!” – Hodor",
    "“Hodor.” – Hodor",
    "“There's no cure for being a c***.” – Bronn",
    "“Lots of people name their swords.” – Arya Stark",
    "“Lots of c***s.” – The Hound",
    "“If any more words come pouring out your c*** mouth...” – The Hound",
    "“Fuck the king.” – Sandor Clegane",
    "“I understand that if any more words come pouring out your mouth, I'm going to have to eat every chicken in this room.” – The Hound",
    "“Which one of you cowards shit in my pants?” – Tormund",
    "“I've always had blue eyes!” – Tormund",
    "“You spent too much time with Jon Snow. He knows nothing.” – Tormund",
    "“The big woman still here?” – Tormund",
    "“You know nothing, Jon Snow.” – Ygritte",
    "“The man who passes the sentence should swing the sword.” – Ned Stark"
];

function setRandomQuote(elementId) {
    let el = document.getElementById(elementId);
    if (el) el.innerText = quotes[Math.floor(Math.random() * quotes.length)];
}

// Curated battle/header quotes for character mode (user-provided favorites)
const battleInfoQuotes = [
    "When you play the Game of Thrones, you win or you die.",
    "The Iron Throne is won one choice at a time. Choose wisely.",
    "Every choice shapes the realm. Choose your champion.",
    "The realm remembers every decision. Choose wisely.",
    "In the Game of Thrones, loyalties are tested. Choose wisely.",
    "Winter is coming. Choose the one who stands beside you."
];

function setBattleInfoQuote() {
    let el = document.getElementById("battle-info");
    if (!el) return;
    el.innerText = battleInfoQuotes[Math.floor(Math.random() * battleInfoQuotes.length)];
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
    setRandomQuote("home-quote");
    document.getElementById("character-mode-btn").addEventListener("click", () => {
        document.getElementById("home-screen").classList.add("hidden");
        document.getElementById("submode-screen").classList.remove("hidden");
        setRandomQuote("submode-quote");
    });
    document.getElementById("animal-mode-btn").addEventListener("click", () => {
        if (allCreaturesData.length) startQuiz('animal', allCreaturesData, 0);
        else alert("Creatures data not loaded");
    });
    document.querySelectorAll("[data-submode]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            let submode = e.currentTarget.getAttribute("data-submode");
            let filtered = [...allCharactersData];
            let battleCap = 70;
            if (submode === "top20") { filtered = allCharactersData.filter(c => c.seed_rank && c.seed_rank <= 20); battleCap = 70; }
            else if (submode === "top50") { filtered = allCharactersData.filter(c => c.seed_rank && c.seed_rank <= 50); battleCap = 110; }
            else { battleCap = 150; }
            startQuiz('character', filtered, battleCap);
        });
    });
    document.getElementById("back-from-submode").addEventListener("click", () => resetToHome());
    document.getElementById("back-from-battle").addEventListener("click", () => resetToHome());
    document.getElementById("back-from-results").addEventListener("click", () => resetToHome());
});

function resetToHome() {
    document.getElementById("sort-screen").classList.add("hidden");
    document.getElementById("result-screen").classList.add("hidden");
    document.getElementById("submode-screen").classList.add("hidden");
    document.getElementById("home-screen").classList.remove("hidden");
    setRandomQuote("home-quote");
}

const aboutBtn = document.getElementById("about-btn");
if (aboutBtn) {
    aboutBtn.addEventListener("click", () => {
        window.location.replace("about.html");
    });
}
