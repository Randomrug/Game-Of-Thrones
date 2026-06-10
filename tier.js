// ==========================================
// GAME OF THRONES TIER LIST
// ==========================================

const tierModeBtn = document.getElementById("tier-mode-btn");
const tierScreen = document.getElementById("tier-screen");
const homeScreen = document.getElementById("home-screen");
const backFromTier = document.getElementById("back-from-tier");

const characterPool = document.getElementById("character-pool");

const chaosMessage = document.getElementById("chaos-message");

const saveTierBtn = document.getElementById("save-tier-btn");
const emailTierBtn = document.getElementById("email-tier-btn");

// ==========================================
// FUNNY MESSAGES
// ==========================================

const CHAOS_MESSAGES = [

"Congratulations. You offended every House in Westeros.",

"Tyrion has demanded wine after seeing this ranking.",

"Varys knows. Somehow Varys always knows.",

"Jon Snow knows nothing. Your tier list knows less.",

"Cersei approved this ranking. That's alarming.",

"The Night King marched south just to judge you.",

"Arya has quietly added your name to a list.",

"Three dragons have left negative reviews.",

"The realm is in chaos. Excellent work.",

"Even Bran didn't see this coming."

];

// ==========================================
// CHARACTER DATA
// ==========================================

let CHARACTERS = [

{
name:"Jon Snow",
image:"images/jon.jpg"
},

{
name:"Daenerys Targaryen",
image:"images/dany.jpg"
},

{
name:"Tyrion Lannister",
image:"images/tyrion.jpg"
},

{
name:"Arya Stark",
image:"images/arya.jpg"
},

{
name:"Jaime Lannister",
image:"images/jaime.jpg"
},

{
name:"Cersei Lannister",
image:"images/cersei.jpg"
},

{
name:"The Hound",
image:"images/hound.jpg"
}

// ADD ALL REMAINING CHARACTERS

];

// ==========================================
// LOAD CHARACTER DATA FROM JSON
// ==========================================

async function loadCharacterData()
{
    const response =
    await fetch("Json/characters.json");

    CHARACTERS =
    await response.json();

    loadCharacters();
}

// ==========================================
// OPEN TIER SCREEN
// ==========================================

tierModeBtn.addEventListener("click", () =>
{
homeScreen.classList.add("hidden");

tierScreen.classList.remove("hidden");

loadCharacterData();

randomChaosMessage();
});

// ==========================================
// RETURN HOME
// ==========================================

backFromTier.addEventListener("click", () =>
{
tierScreen.classList.add("hidden");

homeScreen.classList.remove("hidden");
});

// ==========================================
// RANDOM MESSAGE
// ==========================================

function randomChaosMessage()
{
chaosMessage.innerText =
CHAOS_MESSAGES[
Math.floor(
Math.random() *
CHAOS_MESSAGES.length
)
];
}

// ==========================================
// CHARACTER LOAD
// ==========================================

function loadCharacters()
{
if(characterPool.dataset.loaded)
{
return;
}

characterPool.dataset.loaded = true;

CHARACTERS.forEach(character =>
{
const card =
document.createElement("div");

card.className =
"tier-character";

card.draggable = true;

card.innerHTML =
`
<img src="${character.image}" alt="${character.name}">
<div class="tier-character-name">
${character.name}
</div>
`;

card.addEventListener(
"dragstart",
dragStart
);

characterPool.appendChild(card);
});
}

// ==========================================
// DRAGGING
// ==========================================

let draggedElement = null;

function dragStart()
{
draggedElement = this;
}

document
.querySelectorAll(".tier-dropzone")
.forEach(zone =>
{
zone.addEventListener(
"dragover",
e =>
{
e.preventDefault();
}
);

zone.addEventListener(
"drop",
e =>
{
e.preventDefault();

if(draggedElement)
{
zone.appendChild(
draggedElement
);
}
}
);
});

characterPool.addEventListener(
"dragover",
e =>
{
e.preventDefault();
}
);

characterPool.addEventListener(
"drop",
e =>
{
e.preventDefault();

if(draggedElement)
{
characterPool.appendChild(
draggedElement
);
}
}
);

// ==========================================
// SAVE IMAGE
// ==========================================

saveTierBtn.addEventListener(
"click",
() =>
{
const captureArea =
document.getElementById(
"tier-capture"
);

html2canvas(
captureArea,
{
backgroundColor:null,
scale:2
}
)
.then(canvas =>
{
const link =
document.createElement("a");

link.download =
"my_westeros_tier_list.png";

link.href =
canvas.toDataURL(
"image/png"
);

link.click();
});
}
);

// ==========================================
// EMAIL
// ==========================================

emailTierBtn.addEventListener(
"click",
() =>
{
const tierNames =
Array.from(
document.querySelectorAll(
".tier-title"
)
)
.map(
t => t.value
)
.join("\n");

const subject =
encodeURIComponent(
"My Westeros Tier List"
);

const body =
encodeURIComponent(
`Dear Jaime Fucking Lannister,

I have attached my tier list.

I now await judgement,
mockery,
approval,
or public execution.

May the Seven have mercy.

Regards,

A citizen of Westeros`
);

window.location.href =
`mailto:jaimefuckinglannister7@gmail.com?subject=${subject}&body=${body}`;
}
);