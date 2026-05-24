/* ==========================================
   PITCHPERSONA AI - CORE ENGINE & AGENT LOGIC
   ========================================== */

// 1. STATE & INITIALIZATION
let selectedPersona = "RCB FAN";
let activeTab = "commentary";
let customPersonas = [];
let soundEnabled = true;
let audioCtx = null;
let simulatedScore = { runs: 165, wickets: 4, overs: 18, balls: 0, target: 172 };
let tickerInterval = null;
let tickerIsPlaying = false;
let synthesisSpeech = null;

// Core built-in personas list
const builtInPersonas = [
  {
    id: "RCB FAN",
    name: "RCB FAN",
    emoji: "🦁",
    team: "RCB",
    vibe: "DEPRESSED",
    catchphrases: ["Ee Sala Cup Namde", "pain is permanent", "kidney winners", "vintage RCB collapse", "King Kohli", "calculator ready"]
  },
  {
    id: "CSK FAN",
    name: "CSK FAN",
    emoji: "💛",
    team: "CSK",
    vibe: "CALM",
    catchphrases: ["Trust Thala", "calculated chase", "Dhoni finishes in style", "whistle podu", "classy win", "experience matters"]
  },
  {
    id: "MI FAN",
    name: "MI FAN",
    emoji: "💙",
    team: "MI",
    vibe: "AGGRESSIVE",
    catchphrases: ["5 Trophies bro", "respect the legacy", "Ambanis", "Rohit Vadapav", "class of MI", "Bumrah saves us"]
  },
  {
    id: "TOXIC TWITTER",
    name: "TOXIC TWITTER",
    emoji: "💀",
    team: "NEUTRAL",
    vibe: "SARCASTIC",
    catchphrases: ["Fraud academy", "Chokli", "Finished player", "Statpadder", "cry louder", "Retire now", "PR agency active"]
  },
  {
    id: "CALM ANALYST",
    name: "CALM ANALYST",
    emoji: "📊",
    team: "NEUTRAL",
    vibe: "CALM",
    catchphrases: ["Win probability shift", "expected wickets", "statistically superior", "runs per over", "matchup analytics"]
  },
  {
    id: "MEME LORD",
    name: "MEME LORD",
    emoji: "🤡",
    team: "NEUTRAL",
    vibe: "SARCASTIC",
    catchphrases: ["Admins crying", "Instagram servers down", "meme pages eating good", "Vibe check failed", "absolute circus"]
  },
  {
    id: "ANGRY FAN",
    name: "ANGRY FAN",
    emoji: "😡",
    team: "NEUTRAL",
    vibe: "AGGRESSIVE",
    catchphrases: ["TV is broken", "controller smashed", "unbelievable selection", "worst team ever", "clown fielding"]
  },
  {
    id: "HARSHA VOICE",
    name: "HARSHA BHOGLE",
    emoji: "🎙️",
    team: "NEUTRAL",
    vibe: "CALM",
    catchphrases: ["Oh what a beauty", "cricket is the real winner", "absolute poetry in motion", "he is putting on a clinic"]
  },
  {
    id: "GAMBHIR DISCIPLE",
    name: "GAMBHIR VIBE",
    emoji: "😠",
    team: "NEUTRAL",
    vibe: "AGGRESSIVE",
    catchphrases: ["It is not about individuals", "no one credits the bowler", "1 classification doesn't win cups", "PR hype"]
  }
];

// Document Load Event Listener
document.addEventListener("DOMContentLoaded", () => {
  loadCustomPersonas();
  renderPersonas();
  renderDebateSelectors();
  updateAnalyticsDashboard("Nothing selected yet.", "Neutral");
  initSpeechVoices();
  createBackgroundParticles();
});

// 2. SYNTHESIZED SOUND EFFECTS (Web Audio API)
function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById("soundToggle");
  btn.textContent = soundEnabled ? "🔊 SOUND ON" : "🔇 SOUND OFF";
  if (soundEnabled) {
    playSynthSound("chime");
  }
}

function playSynthSound(type) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "chime") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "rumble") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === "typing") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.02);
      osc.start(now);
      osc.stop(now + 0.02);
    }
  } catch (e) {
    console.error("Audio synthesis failed:", e);
  }
}

// 3. AMBIENT BACKGROUND EFFECTS
function createBackgroundParticles() {
  const container = document.getElementById("particleContainer");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 20; i++) {
    const p = document.createElement("div");
    p.style.position = "absolute";
    p.style.width = Math.random() * 6 + 2 + "px";
    p.style.height = p.style.width;
    p.style.background = Math.random() > 0.5 ? "#ff8400" : "#00a2ff";
    p.style.borderRadius = "50%";
    p.style.left = Math.random() * 100 + "%";
    p.style.top = Math.random() * 100 + "%";
    p.style.opacity = Math.random() * 0.3 + 0.1;
    p.style.pointerEvents = "none";
    p.style.transform = `translateY(0)`;
    p.animate([
      { transform: `translateY(0px) translateX(0px)`, opacity: 0.1 },
      { transform: `translateY(${-Math.random() * 100 - 50}px) translateX(${Math.random() * 40 - 20}px)`, opacity: 0.5 },
      { transform: `translateY(${-Math.random() * 200 - 100}px) translateX(${Math.random() * 80 - 40}px)`, opacity: 0 }
    ], {
      duration: Math.random() * 8000 + 4000,
      iterations: Infinity,
      easing: "ease-in-out"
    });
    container.appendChild(p);
  }
}

// 4. TAB NAVIGATION
function switchTab(tabId) {
  playSynthSound("click");
  activeTab = tabId;
  
  // Update nav active styles
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.tab === tabId) btn.classList.add("active");
  });

  // Update tabs active state
  document.querySelectorAll(".tab-content").forEach(content => {
    content.classList.remove("active");
  });
  const activeSection = document.getElementById(`tab-${tabId}`);
  if (activeSection) activeSection.classList.add("active");
}

// 5. RENDER AGENT CARDS
function renderPersonas() {
  const grid = document.getElementById("personaGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const all = [...builtInPersonas, ...customPersonas];
  all.forEach(p => {
    const div = document.createElement("div");
    div.className = `persona ${p.id === selectedPersona ? 'active' : ''}`;
    div.setAttribute("data-persona", p.id);
    div.setAttribute("data-team", p.team);
    div.onclick = () => selectPersona(p.id);

    div.innerHTML = `
      <span>${p.emoji}</span>
      <p>${p.name}</p>
    `;
    grid.appendChild(div);
  });
}

function selectPersona(id) {
  playSynthSound("click");
  selectedPersona = id;
  renderPersonas();
  
  const all = [...builtInPersonas, ...customPersonas];
  const p = all.find(x => x.id === id);
  if (p) {
    updateAnalyticsDashboard("Switched focus to persona: " + p.name, p.team);
  }
}

// Render checkboxes in debate selectors
function renderDebateSelectors() {
  const container = document.getElementById("debateSelectors");
  if (!container) return;
  container.innerHTML = "";

  const all = [...builtInPersonas, ...customPersonas];
  
  // Pick default debaters
  const defaultDebaters = ["RCB FAN", "MI FAN", "CSK FAN", "TOXIC TWITTER"];

  all.forEach(p => {
    const isChecked = defaultDebaters.includes(p.id);
    const label = document.createElement("label");
    label.className = "checkbox-tag";
    label.innerHTML = `
      <input type="checkbox" value="${p.id}" ${isChecked ? 'checked' : ''} onchange="playSynthSound('click')"/>
      <span>${p.emoji} ${p.name}</span>
    `;
    container.appendChild(label);
  });
}

// 6. DYNAMIC TEXT FILLERS
function fillEvent(text) {
  playSynthSound("click");
  const input = document.getElementById("eventInput");
  input.value = text;
  updateCharCount();
  triggerButtonHype("genReactionBtn");
}

function fillDebateEvent(text) {
  playSynthSound("click");
  document.getElementById("debateEvent").value = text;
  triggerButtonHype("startDebateBtn");
}

function updateCharCount() {
  const text = document.getElementById("eventInput").value;
  document.getElementById("commentaryWordCount").textContent = `${text.length} chars`;
}

function updateRageVal(val) {
  document.getElementById("rageVal").textContent = `${val}x`;
  if (val >= 2) {
    playSynthSound("rumble");
  } else {
    playSynthSound("click");
  }
}

function triggerButtonHype(btnId) {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.style.transform = "scale(1.05)";
    setTimeout(() => btn.style.transform = "", 150);
  }
}

// 7. OFFLINE INTELLIGENT commentary AI GENERATOR
function generateOfflineCommentary(persona, eventText, memeMode, rageFactor) {
  const p = [...builtInPersonas, ...customPersonas].find(x => x.id === persona) || builtInPersonas[0];
  const eLower = eventText.toLowerCase();
  
  let opening = "";
  let body = "";
  let closing = "";
  
  // Custom catchphrase pool
  const cp = p.catchphrases;
  const catchphrase1 = cp[0];
  const catchphrase2 = cp[1] || cp[0];
  const catchphrase3 = cp[2] || cp[0];

  // Logic based on keywords
  const isKohli = eLower.includes("kohli") || eLower.includes("virat");
  const isDhoni = eLower.includes("dhoni") || eLower.includes("thala") || eLower.includes("msd");
  const isBumrah = eLower.includes("bumrah") || eLower.includes("jasprit");
  const isDuck = eLower.includes("duck") || eLower.includes("out") || eLower.includes("wicket") || eLower.includes("dismissed");
  const isSix = eLower.includes("six") || eLower.includes("6") || eLower.includes("boundary") || eLower.includes("boundary");
  const isWin = eLower.includes("win") || eLower.includes("won") || eLower.includes("victory");

  // Offline Templates per Persona
  switch(p.id) {
    case "RCB FAN":
      if (isKohli && isDuck) {
        opening = `😭 NOOOO! NOT KING KOHLI! I CANNOT BELIEVE THIS! My entire evening is completely ruined.`;
        body = `Why does this only happen to us? Literally every single season is built on absolute despair. ${catchphrase2.toUpperCase()} is officially locked inside a chamber of tears. 49 all over again.`;
        closing = `Vintage RCB. We are literally donating points at this rate. ${catchphrase1}... but pain is permanent bro. 💔`;
      } else if (isWin) {
        opening = `🤩 OMGGGGG! WE ACTUALLY WON! IS THIS REAL LIFE? QUICK, SOMEONE PINCH ME!`;
        body = `This is statistically the greatest night of my life. Kohli, Siraj, everyone was on fire! We defended this like absolute lions. Champions vibe!`;
        closing = `EE SALA CUP NAMDE!!! 🏆 Let the haters cry louder! 🔴`;
      } else {
        opening = `💔 Here we go again... My heart rate is literally 180bpm right now.`;
        body = `This match event ("${eventText}") is classic IPL. RCB fans are currently opening their calculators and computing Net Run Rate scenarios for the next 4 matches. Standard procedure.`;
        closing = `At the end of the day, we win hearts, kidneys, and lungs. Legacy stuff. ${catchphrase1}! 😭`;
      }
      break;

    case "CSK FAN":
      if (isDhoni && isSix) {
        opening = `🦁 THALA FOR A REASON! THE KING OF FINISHES DOES IT AGAIN! Absolute goosebumps in the stadium!`;
        body = `44 years old but still striking it clean at 200+ strike rate. This is pure unadulterated legacy. Dhoni showing these youngsters how to handle extreme 20th over pressure.`;
        closing = `Never doubt the calculated chase. Whistle Podu! 💛`;
      } else if (isDuck) {
        opening = `🟡 Stay calm. Do not panic. CSK fans do not get flustered.`;
        body = `Losing a wicket is part of the blueprint. We have depth till number 9. Ruturaj and the management have this fully under control. It's a calculated transition.`;
        closing = `Trust Thala. The game is never over until the final whistle. 😎`;
      } else {
        opening = `😎 Calmly whistle poduing in the corner. Another typical day in the CSK camp.`;
        body = `This moment: "${eventText}" is just a blip. We have qualified for the playoffs 12 times for a reason. Stable management, zero drama, just pure cricket intelligence.`;
        closing = `Let the other teams fight over social media. We focus on trophies. 🏆`;
      }
      break;

    case "MI FAN":
      if (isBumrah) {
        opening = `💙 JASPRIT BUMRAH! The undisputed cheat-code of world cricket!`;
        body = `Who needs batting when you have a guy bowling 4 overs for 12 runs and taking 3 crucial wickets? Unplayable yorkers. Best squad in the history of the tournament.`;
        closing = `5 Trophies. Respect the legacy. 😤`;
      } else if (isWin) {
        opening = `😤 Typical MI dominance. We know exactly how to win crucial match points!`;
        body = `Our scouting academy produces champions. Hardik, Surya, Bumrah, Rohit. This is a blueprint built on pure powerhouse dominance. Other clubs can only dream.`;
        closing = `Check the trophy cabinet before talking to us. 5 Cups. Legacy established. 💙`;
      } else {
        opening = `🙄 Oh, look at everyone celebrating a single wicket. Cute.`;
        body = `This event ("${eventText}") literally doesn't shake us. We have faced worse. We are slow starters but absolute beasts in the business end of the tournament.`;
        closing = `Come back when your team has 5 golden cups. Until then, keep quiet. 🏆`;
      }
      break;

    case "TOXIC TWITTER":
      if (isKohli) {
        opening = `💀 BREAKING: Chokli's PR agency currently drafting 15 cover-up tweets! Finished player!`;
        body = `Statpadding at its finest. Playing for individual milestones while the team sinks. Absolutely zero intent. He should honestly retire and go to London full-time.`;
        closing = `Fraud academy head. Cry more fans, your king is finished. 🤡`;
      } else if (isDhoni) {
        opening = `☠️ MS Dhoni flexing standard singles while needing 18 an over. Credit stealer loading!`;
        body = `Typical standard defensive play. Watch his toxic cult blame the pitch and the youngsters for this outcome. Absolute PR masterpiece.`;
        closing = `Unbelievably overrated. Finished player. 👢`;
      } else {
        opening = `🔥 Twitter servers officially crashing! This is absolute cinema!`;
        body = `What a absolute fraud performance ("${eventText}"). The absolute state of IPL cricket. Unfit players, terrible DRS, absolute clown league.`;
        closing = `#FinishedPlayer trending in 3... 2... 1... 😭`;
      }
      break;

    case "CALM ANALYST":
      opening = `📊 ANALYTICAL SUMMARY: Factoring key metrics for this delivery.`;
      body = `Following "${eventText}", the batting team's projected score adjusts down by 18.2 runs. The win-probability model now indicates a 62.4% advantage for the bowling side, primarily due to the high dot-ball percentage.`;
      closing = `Matchup analysis suggests that bowling spin in the death overs was a high-risk, low-reward calculation. Statistically validated.`;
      break;

    case "MEME LORD":
      opening = `🤡 ADMINS ARE EATING EXTREMELY GOOD TONIGHT! Thank you for the content!`;
      body = `Instagram meme pages are literally drafting templates as we speak. This event ("${eventText}") is going to trigger 400 new viral reels with vintage emotional songs.`;
      closing = `Absolute circus. Twitter admins officially crying tears of pure joy right now. 😂`;
      break;

    case "ANGRY FAN":
      opening = `🤬 YAAR KYA BAKWAAS HAI YEH!!! I AM LITERALLY SCREAMING!`;
      body = `WHAT IS THIS FIELDING? WHAT IS THIS SELECTION? Why are we paying crores of rupees to these clowns to drop simple catches? My TV is officially broken. I threw my remote right into the display.`;
      closing = `Worst team selection in the history of franchise sports. BAN THIS TEAM IMMEDIATELY! 😡`;
      break;
      
    case "HARSHA VOICE":
      opening = `🎙️ Oh, would you believe it! Absolute drama here at the stadium!`;
      body = `What a majestic event ("${eventText}"). The crowd is on its feet, the atmosphere is electric! You can feel the sheer emotion, the history, the legacy of this great tournament unfolding before our very eyes!`;
      closing = `Cricket, at the end of the day, is the ultimate winner. What a spectacular sport. 🌟`;
      break;

    case "GAMBHIR DISCIPLE":
      opening = `😠 Let me be absolutely clear. Let's stop worshipping individual players.`;
      body = `Everyone will write articles about the batsman who hit the boundary, but did anyone talk about the bowler who bowled three dot balls in the 19th over? No. This is why we don't win international cups. PR-driven culture.`;
      closing = `Cups are won by squad efforts, not individual 100s. Facts only.`;
      break;

    default: // Custom Persona logic
      opening = `🔥 Custom Agent [${p.name}] Reacting Live! emoji: ${p.emoji}`;
      body = `As a fan representing team ${p.team} with a ${p.vibe} vibration, my response to "${eventText}" is: '${catchphrase1}'! This matches my vibe of always being a ${p.vibe.toLowerCase()} fan.`;
      closing = `Catchphrases check: ${catchphrase2}! ${catchphrase3}! ${p.emoji}`;
      break;
  }

  // Adjust for Meme Mode
  if (memeMode) {
    body += `\n\n[MEME UPDATE]: Twitter space is currently hosting a 50k listener debate with everyone shouting over each other. Ambani's script writer has been fired.`;
  }

  // Adjust for Rage Factor
  if (rageFactor > 1.5) {
    opening = opening.toUpperCase();
    closing = closing.toUpperCase() + ` !!!`;
    body = body.split(". ").join("!!! ").toUpperCase();
  }

  return `${p.emoji} ${p.name} REACTION:\n\n${opening}\n\n${body}\n\n${closing}`;
}

// 8. COMMENTARY GENERATOR RUNNER
async function generateReaction() {
  const eventInput = document.getElementById("eventInput");
  const eventText = eventInput.value;
  const memeMode = document.getElementById("memeToggle").checked;
  const rageMultiplier = parseFloat(document.getElementById("rageMultiplier").value);
  const output = document.getElementById("output");

  if (!eventText || eventText.trim() === "") {
    playSynthSound("rumble");
    output.innerHTML = "<span style='color:#ff3e3e;'>Please enter or select a live IPL event first!</span>";
    return;
  }

  playSynthSound("click");
  output.innerHTML = `
    <div class="typing-bubble">
      <div class="dots"><span></span><span></span><span></span></div>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 5px;">AI Persona is cooking commentary...</p>
    </div>
  `;

  // Simulate AI delay
  setTimeout(async () => {
    let resultText = "";
    
    // Check if real API Key exists
    const apiKey = localStorage.getItem("gemini_api_key");
    const activeModel = localStorage.getItem("gemini_model") || "gemini-1.5-flash";

    if (apiKey) {
      // Fetch dynamic content via Gemini API
      try {
        resultText = await fetchGeminiCommentary(apiKey, activeModel, selectedPersona, eventText, memeMode, rageMultiplier);
      } catch (err) {
        console.error("Gemini API Error, falling back to local simulation:", err);
        resultText = "⚠️ [API ERROR - FALLING BACK TO OFFLINE CORE]\n\n" + 
          generateOfflineCommentary(selectedPersona, eventText, memeMode, rageMultiplier);
      }
    } else {
      // offline fallback
      resultText = generateOfflineCommentary(selectedPersona, eventText, memeMode, rageMultiplier);
    }

    // Success chime
    playSynthSound("chime");

    // Output formatting
    output.innerHTML = resultText.replace(/\n/g, "<br>");
    
    // Enable TTS button
    const ttsBtn = document.getElementById("ttsBtn");
    if (ttsBtn) ttsBtn.removeAttribute("disabled");
    synthesisSpeech = resultText.replace(/<[^>]*>/g, ""); // strip any html

    // Update charts based on results
    const activePersonaData = [...builtInPersonas, ...customPersonas].find(x => x.id === selectedPersona) || builtInPersonas[0];
    updateAnalyticsDashboard(eventText, activePersonaData.team);
  }, 1000);
}

// 9. CLIENT SIDE GEMINI API CALLER
async function fetchGeminiCommentary(apiKey, modelName, personaId, eventText, memeMode, rageMultiplier) {
  const p = [...builtInPersonas, ...customPersonas].find(x => x.id === personaId) || builtInPersonas[0];
  
  const systemInstruction = `
    You are an extreme, emotional Indian Premier League (IPL) cricket fan persona named "${p.name}".
    Your avatar emoji is "${p.emoji}".
    Your team bias is "${p.team}".
    Your fan vibe style is "${p.vibe}".
    
    Key behavioral catchphrases to incorporate organically: ${p.catchphrases.join(", ")}.
    
    Act exactly as this character. Describe your emotional reaction to the match event: "${eventText}".
    Meme Mode setting is: ${memeMode ? "ACTIVE (include internet jokes, admin sarcasms, twitter slang)" : "INACTIVE"}.
    Rage factor intensity scale: ${rageMultiplier}x (Higher numbers mean MORE screaming, ALL-CAPS words, exclamation marks, and extreme language).
    
    Keep the output formatted under three sections: 
    1. A dramatic opening line.
    2. A multi-sentence body explaining why this is glorious or devastating.
    3. A funny, definitive closing sign-off line with your team catchphrases.
    
    Provide ONLY the raw text response, starting with "${p.emoji} ${p.name} REACTION:". Do not write markdown blocks or HTML wrappers.
  `;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: systemInstruction
        }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`API returned status ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// 10. AGENTIC DEBATE ARENA SYSTEM
let debateInProgress = false;

async function startAgenticDebate() {
  if (debateInProgress) return;
  
  const debateEvent = document.getElementById("debateEvent").value.trim();
  if (!debateEvent) {
    playSynthSound("rumble");
    alert("Please enter a debate trigger match event!");
    return;
  }

  // Find checked personas
  const checkedInputs = document.querySelectorAll("#debateSelectors input:checked");
  const selectedDebaters = Array.from(checkedInputs).map(input => input.value);

  if (selectedDebaters.length < 2) {
    playSynthSound("rumble");
    alert("Please select at least 2 fan agents to debate!");
    return;
  }

  debateInProgress = true;
  playSynthSound("chime");
  
  const debateFeed = document.getElementById("debateFeed");
  const startBtn = document.getElementById("startDebateBtn");
  const statusDisplay = document.getElementById("debateStatus");

  startBtn.setAttribute("disabled", "true");
  startBtn.textContent = "DEBATE IN PROGRESS... ⚔️";
  statusDisplay.textContent = "Agents entering arena...";
  debateFeed.innerHTML = "";

  const rounds = parseInt(document.getElementById("debateTurns").value) || 5;
  const allAgents = [...builtInPersonas, ...customPersonas];
  
  // Track running context of the chat
  let debateHistory = [];

  for (let turn = 0; turn < rounds; turn++) {
    // Determine who speaks this turn (alternate through selected debaters)
    const speakerId = selectedDebaters[turn % selectedDebaters.length];
    const speaker = allAgents.find(x => x.id === speakerId);
    
    statusDisplay.textContent = `${speaker.name} is drafting response...`;

    // Show typing bubble
    const typingId = `typing-${turn}`;
    const typingBubble = document.createElement("div");
    typingBubble.className = "chat-bubble left typing-bubble";
    typingBubble.id = typingId;
    typingBubble.innerHTML = `
      <div class="bubble-sender" style="color: var(--text-muted)">
        ${speaker.emoji} ${speaker.name} is typing
      </div>
      <div class="dots"><span></span><span></span><span></span></div>
    `;
    debateFeed.appendChild(typingBubble);
    debateFeed.scrollTop = debateFeed.scrollHeight;

    // Simulate typing wait / synth sound
    const typingInterval = setInterval(() => playSynthSound("typing"), 200);
    await new Promise(resolve => setTimeout(resolve, 2000));
    clearInterval(typingInterval);

    // Remove typing bubble
    const typingElement = document.getElementById(typingId);
    if (typingElement) typingElement.remove();

    // Generate Turn Statement (Offline vs Gemini)
    let statement = "";
    const apiKey = localStorage.getItem("gemini_api_key");
    const activeModel = localStorage.getItem("gemini_model") || "gemini-1.5-flash";

    if (apiKey) {
      try {
        statement = await fetchGeminiDebateTurn(apiKey, activeModel, speaker, debateEvent, debateHistory);
      } catch (err) {
        console.error("Gemini Debate turn error, offline fallback:", err);
        statement = generateOfflineDebateTurn(speaker, debateEvent, debateHistory);
      }
    } else {
      statement = generateOfflineDebateTurn(speaker, debateEvent, debateHistory);
    }

    // Append to running debate history
    debateHistory.push({
      sender: speaker.name,
      team: speaker.team,
      emoji: speaker.emoji,
      text: statement
    });

    // Render bubble in feed
    const bubble = document.createElement("div");
    const bubbleAlignment = turn % 2 === 0 ? 'left' : 'right';
    bubble.className = `chat-bubble ${bubbleAlignment}`;
    bubble.setAttribute("data-team", speaker.team);
    bubble.setAttribute("data-persona", speaker.id);

    // Styling color tag
    let colorStyle = "";
    if (speaker.team === "RCB") colorStyle = "color: var(--rcb-red);";
    if (speaker.team === "CSK") colorStyle = "color: var(--csk-yellow);";
    if (speaker.team === "MI") colorStyle = "color: var(--mi-blue);";
    if (speaker.id === "TOXIC TWITTER") colorStyle = "color: var(--toxic-purple);";
    if (speaker.id === "CALM ANALYST") colorStyle = "color: var(--calm-teal);";

    bubble.innerHTML = `
      <div class="bubble-sender" style="${colorStyle}">
        <span>${speaker.emoji}</span>
        <strong>${speaker.name}</strong>
      </div>
      <div class="bubble-body">${statement}</div>
    `;

    debateFeed.appendChild(bubble);
    debateFeed.scrollTop = debateFeed.scrollHeight;
    
    // Play sound based on vibe
    if (speaker.vibe === "AGGRESSIVE") {
      playSynthSound("rumble");
    } else {
      playSynthSound("click");
    }

    // Update dynamic statistics based on debate temperature
    updateAnalyticsDashboard(debateEvent, speaker.team);
  }

  // Wrap up debate
  debateInProgress = false;
  startBtn.removeAttribute("disabled");
  startBtn.innerHTML = "INITIATE AGENTIC DEBATE ⚔️";
  statusDisplay.textContent = "Debate concluded!";
  playSynthSound("chime");
}

// Generate an offline debate response that addresses the previous speakers
function generateOfflineDebateTurn(speaker, mainEvent, history) {
  const cp = speaker.catchphrases;
  const slang1 = cp[0];
  const slang2 = cp[1] || cp[0];

  if (history.length === 0) {
    // Opening statement
    if (speaker.team === "RCB") return `Did you guys see what just happened? "${mainEvent}"! This is absolutely classical RCB pain, I am literally crying. ${slang1} but why does cricket hurt so much? 😭`;
    if (speaker.team === "CSK") return `Trust the process guys. Dhoni is analyzing the matchups. "${mainEvent}" is completely part of our tactical roadmap. ${slang1}! 😎`;
    if (speaker.team === "MI") return `Everyone making noise about this minor event "${mainEvent}". Look at our 5 golden trophies before barking. Standard MI class will prevail. 😤`;
    if (speaker.id === "CALM ANALYST") return `Entering debate thread. Factoring the event "${mainEvent}", statistical modeling predicts a high variance outcome. Win-probability remains highly volatile.`;
    return `Can't wait to see the stadium drama unfold over "${mainEvent}"! Absolute cinema is starting! ${speaker.emoji}`;
  }

  // Address previous speaker
  const prev = history[history.length - 1];
  
  if (speaker.id === "TOXIC TWITTER") {
    return `Shut up, ${prev.sender}! Absolute fraud arguments. You are posting absolute garbage. Typical cult fan logic. Retire your account now, you are completely finished! 💀`;
  }
  
  if (speaker.id === "CALM ANALYST") {
    return `Addressing the claims made by ${prev.sender}. Factually, your subjective team emotional bias deviates from the standard empirical deviation. Statistically, there is zero evidence of legacy affecting this delivery. Matchup metrics rule supreme. 📊`;
  }

  if (speaker.id === "MEME LORD") {
    return `Bro, ${prev.sender} is currently typing essays while the absolute clown circus is happening live! Instagram admins are already writing the script for this meme. Keep crying! 😂`;
  }

  if (speaker.id === "ANGRY FAN") {
    return `DO NOT TALK TO ME ABOUT METRICS AND PROCESSES, ${prev.sender}!!! MY TELEVISION IS IN LITERALLY TEN PIECES ON THE LIVING ROOM FLOOR! THIS FIELDING IS DREADFUL! worst team ever! 😡`;
  }

  // Fan team rivalries
  if (speaker.team === "RCB") {
    if (prev.team === "MI") return `Oh, ${prev.sender} flexing Ambanis and trophies from 2015 again. Cry more. At least our fans are loyal and don't rely on umpires! Ee sala cup namde! 🦁`;
    if (prev.team === "CSK") return `Calculated process? Trust Thala? Bro, Dhoni is retired, wake up! CSK is finished. Time for King Kohli to dominate! 🔴`;
    return `Whatever. We are used to the heartbreak, but we keep screaming. ${slang1}! 😭`;
  }

  if (speaker.team === "CSK") {
    if (prev.team === "RCB") return `Classic RCB fan crying, opening calculators, and making noise. Win a single trophy first, then debate with the super kings! Whistle Podu! 💛`;
    if (prev.team === "MI") return `5 trophies, sure, but your team is currently sitting at the bottom of the fair play award grid. Stable management always beats raw chaos. Trust Thala. 😎`;
    return `Calm down. The franchise knows how to manage death pressure. Chennai super class.`;
  }

  if (speaker.team === "MI") {
    if (prev.team === "RCB") return `RCB Fan talking about loyalty? You guys haven't won a cup since the Indus Valley Civilization. 17 years, zero cups. Please respect the legacy of 5 trophies! 😤`;
    if (prev.team === "CSK") return `CSK talking about stability? You guys got suspended for two years, don't talk about clean processes. MI is the gold standard of IPL franchises. 💙`;
    return `We produce the core India squad players. We rule the league. Simple facts.`;
  }

  return `Custom Agent [${speaker.name}] checking in. Addressing ${prev.sender}: '${slang1}'! We have this completely locked in. ${speaker.emoji}`;
}

// Generate Gemini API debate turn
async function fetchGeminiDebateTurn(apiKey, modelName, speaker, mainEvent, history) {
  let conversationHistoryText = history.map(h => `${h.sender} (${h.team}): "${h.text}"`).join("\n");
  
  const systemInstruction = `
    You are acting as "${speaker.name}" (${speaker.emoji}), a highly passionate IPL cricket fan with team bias "${speaker.team}" and vibe "${speaker.vibe}".
    
    The main match event everyone is debating is: "${mainEvent}".
    
    Here is the live chat debate logs so far:
    ${conversationHistoryText}
    
    Draft your immediate next response in the debate.
    RULES:
    1. Address the last speaker in the logs directly and dynamically, reacting to their claims or calling them a clown if you are an aggressive/toxic persona.
    2. Incorporate your signature catchphrases organically: ${speaker.catchphrases.join(", ")}.
    3. Keep it brief (2-4 sentences max), emotional, highly colloquial (Indian internet slang allowed), and stay fully in character.
    4. Provide ONLY your raw message statement. Do not prefix with your name or any formatting.
  `;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: systemInstruction
        }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`API returned status ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// 11. LIVE MATCH TICKER SIMULATOR
const simulatedMatches = ["RCB vs CSK", "MI vs RCB", "CSK vs MI", "RCB vs KKR"];
const simulatedEventsList = [
  { text: "Bumrah bowls an absolute toe-crusher yorker, clean bowling Dhoni!", type: "highlight", scoreChange: { runs: 0, wickets: 1 } },
  { text: "Kohli steps down the track and launches the ball 112 meters into the stadium roof! SIX!", type: "highlight", scoreChange: { runs: 6, wickets: 0 } },
  { text: "Controversial DRS: Ball tracking clips leg-stump, umpire calls Out! Team is absolutely furious!", type: "highlight", scoreChange: { runs: 0, wickets: 1 } },
  { text: "Rohit Sharma pulls it over square leg for a magnificent flat boundary! FOUR!", type: "normal", scoreChange: { runs: 4, wickets: 0 } },
  { text: "Super Over Triggered! The scores are level at 195! Complete stadium absolute madness!", type: "highlight", scoreChange: { runs: 0, wickets: 0 } },
  { text: "Wicket! Ravindra Jadeja takes a brilliant running catch at deep boundary! Team is dancing!", type: "highlight", scoreChange: { runs: 0, wickets: 1 } },
  { text: "No-ball on final delivery! Free hit given! Crowd is roaring in absolute tension!", type: "highlight", scoreChange: { runs: 1, wickets: 0 } },
  { text: "Maxwell drops a absolute sitter catch at slip, batsman runs two runs! Captain facepalms!", type: "normal", scoreChange: { runs: 2, wickets: 0 } },
  { text: "Jasprit Bumrah bowls a tight maiden over in the death overs, only 2 runs conceded!", type: "normal", scoreChange: { runs: 2, wickets: 0 } }
];

function toggleTickerSimulation() {
  playSynthSound("click");
  const playBtn = document.getElementById("tickerPlayBtn");
  const pulseDot = document.getElementById("simPulseDot");
  const statusText = document.getElementById("simStatusText");

  if (tickerIsPlaying) {
    // Pause
    clearInterval(tickerInterval);
    tickerIsPlaying = false;
    playBtn.textContent = "▶️ START MATCH TICKER";
    playBtn.style.background = "#00a2ff";
    pulseDot.classList.remove("active");
    statusText.textContent = "PAUSED";
  } else {
    // Play
    tickerIsPlaying = true;
    playBtn.textContent = "⏸️ PAUSE MATCH TICKER";
    playBtn.style.background = "#ff3c3c";
    pulseDot.classList.add("active");
    statusText.textContent = "LIVE FEED ACTIVE";
    
    // Trigger first immediately and then interval
    generateSingleTickerEvent();
    tickerInterval = setInterval(generateSingleTickerEvent, 10000); // every 10 seconds
  }
}

function generateSingleTickerEvent() {
  playSynthSound("typing");
  
  // Pick random event
  const eventObj = simulatedEventsList[Math.floor(Math.random() * simulatedEventsList.length)];
  
  // Advance simulated score
  simulatedScore.balls++;
  if (simulatedScore.balls >= 6) {
    simulatedScore.overs++;
    simulatedScore.balls = 0;
  }
  simulatedScore.runs += eventObj.scoreChange.runs;
  simulatedScore.wickets += eventObj.scoreChange.wickets;
  
  if (simulatedScore.wickets >= 10) {
    simulatedScore.wickets = 0;
    simulatedScore.runs = 0;
    simulatedScore.overs = 0;
  }

  // Render score
  document.getElementById("tickerScore").textContent = `${simulatedScore.runs}/${simulatedScore.wickets} (${simulatedScore.overs}.${simulatedScore.balls} Overs)`;

  // Add event to feed
  const stream = document.getElementById("tickerStream");
  
  // Clear placeholder if first event
  const empty = stream.querySelector(".ticker-empty");
  if (empty) empty.remove();

  const item = document.createElement("div");
  item.className = `ticker-item ${eventObj.type === 'highlight' ? 'highlight' : ''}`;
  
  const ballText = `${simulatedScore.overs}.${simulatedScore.balls}`;
  item.innerHTML = `
    <span class="ticker-ball font-orbitron">${ballText}</span>
    <span class="ticker-event-text">${eventObj.text}</span>
    <button class="ticker-btn-react" onclick="feedTickerToArena('${eventObj.text}')">🎤 React</button>
  `;

  stream.insertBefore(item, stream.firstChild);

  // Keep last 15 items
  while (stream.children.length > 15) {
    stream.lastChild.remove();
  }

  // Update dynamic sidebar active focus card
  document.getElementById("sidebarFocusEvent").textContent = `"${eventObj.text}"`;

  // Auto-debate trigger
  const autoDebate = document.getElementById("autoDebateToggle").checked;
  if (autoDebate) {
    // Switch to debate tab and start debate
    document.getElementById("debateEvent").value = eventObj.text;
    if (activeTab !== "debate") {
      switchTab("debate");
    }
    startAgenticDebate();
  } else {
    // Just update dashboard
    updateAnalyticsDashboard(eventObj.text, "NEUTRAL");
  }
}

function feedTickerToArena(text) {
  playSynthSound("click");
  document.getElementById("eventInput").value = text;
  document.getElementById("debateEvent").value = text;
  updateCharCount();
  switchTab("commentary");
  generateReaction();
}

// 12. DYNAMIC STADIUM STATS DASHBOARD UPDATES
function updateAnalyticsDashboard(eventText, activeTeam) {
  const eLower = eventText.toLowerCase();
  
  // Calculations based on match triggers
  let hype = 40 + Math.floor(Math.random() * 20); // base hype
  let tension = 30 + Math.floor(Math.random() * 25); // base tension
  let teamAWin = 50;

  if (eLower.includes("six") || eLower.includes("6") || eLower.includes("last-ball")) {
    hype = 90 + Math.floor(Math.random() * 10);
    tension = 80 + Math.floor(Math.random() * 20);
  }
  if (eLower.includes("duck") || eLower.includes("out") || eLower.includes("wicket")) {
    hype = 75 + Math.floor(Math.random() * 15);
    tension = 85 + Math.floor(Math.random() * 15);
  }
  
  // Win probability shift based on active team bias
  if (activeTeam === "RCB") {
    teamAWin = eLower.includes("win") || eLower.includes("six") ? 80 : 25;
  } else if (activeTeam === "CSK") {
    teamAWin = eLower.includes("six") || eLower.includes("win") ? 75 : 45;
  } else if (activeTeam === "MI") {
    teamAWin = eLower.includes("yorker") || eLower.includes("win") ? 82 : 48;
  } else {
    teamAWin = 40 + Math.floor(Math.random() * 20);
  }

  const teamBWin = 100 - teamAWin;

  // 1. Update Win Probability Bar & Labels
  const barA = document.getElementById("teamABar");
  const barB = document.getElementById("teamBBar");
  const winLabel = document.getElementById("winProbText");

  if (barA && barB) {
    barA.style.width = `${teamAWin}%`;
    barB.style.width = `${teamBWin}%`;
    winLabel.textContent = `${teamAWin}% - ${teamBWin}%`;
    
    // Update sidebar labels based on team focus
    document.getElementById("teamALabel").textContent = activeTeam !== "NEUTRAL" ? activeTeam : "BATSMEN";
    document.getElementById("teamBLabel").textContent = activeTeam !== "NEUTRAL" ? "OPPONENT" : "BOWLERS";
  }

  // 2. Update Radial Gauges using Stroke-Dashoffset
  // Circumference of r=40 is 2 * Math.PI * 40 ≈ 251.2
  const maxStroke = 251.2;

  const hypeGauge = document.getElementById("hypeGaugeFill");
  const hypeText = document.getElementById("hypeText");
  if (hypeGauge) {
    const offset = maxStroke - (hype / 100) * maxStroke;
    hypeGauge.style.strokeDashoffset = offset;
    hypeText.textContent = `${hype}%`;
  }

  const rageGauge = document.getElementById("rageGaugeFill");
  const rageText = document.getElementById("rageText");
  if (rageGauge) {
    const offset = maxStroke - (tension / 100) * maxStroke;
    rageGauge.style.strokeDashoffset = offset;
    rageText.textContent = `${tension}%`;
  }

  // 3. Dynamic legacy counters changes
  const trophyRCB = document.getElementById("statTrophyRCB");
  if (trophyRCB) {
    if (eLower.includes("win") && activeTeam === "RCB") {
      trophyRCB.textContent = "1🏆";
      trophyRCB.style.color = "#00ffaa";
      trophyRCB.style.textShadow = "0 0 10px #00ffaa";
    } else {
      trophyRCB.textContent = "0🏆";
      trophyRCB.style.color = "#ff3c3c";
      trophyRCB.style.textShadow = "none";
    }
  }

  const memeLevel = document.getElementById("statMemeLevel");
  if (memeLevel) {
    memeLevel.textContent = eLower.includes("duck") || eLower.includes("dropped") ? "99+" : "42";
  }
}

// 13. AUDIO TEXT TO SPEECH CONTROLS
let synthVoices = [];

function initSpeechVoices() {
  if (typeof speechSynthesis === "undefined") return;
  
  const loadVoices = () => {
    synthVoices = speechSynthesis.getVoices();
    const select = document.getElementById("voiceSelect");
    if (!select) return;
    
    select.innerHTML = "";
    
    // Add default
    const defOpt = document.createElement("option");
    defOpt.value = "default";
    defOpt.textContent = "Default System Voice";
    select.appendChild(defOpt);

    // Filter interesting english & local language accents
    synthVoices.forEach((voice, index) => {
      if (voice.lang.includes("en") || voice.lang.includes("in") || voice.lang.includes("hi")) {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = `${voice.name} (${voice.lang})`;
        select.appendChild(opt);
      }
    });
  };

  loadVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }
}

function speakReaction() {
  if (!synthesisSpeech || typeof speechSynthesis === "undefined") return;
  
  // Cancel current speech
  speechSynthesis.cancel();
  
  const select = document.getElementById("voiceSelect");
  const selectedIndex = select.value;
  
  const utterance = new SpeechSynthesisUtterance(synthesisSpeech);
  
  if (selectedIndex !== "default" && synthVoices[selectedIndex]) {
    utterance.voice = synthVoices[selectedIndex];
  }
  
  // Rate and Pitch adjustments based on current selected rage multiplier
  const rage = parseFloat(document.getElementById("rageMultiplier").value) || 1.0;
  utterance.rate = rage > 1.5 ? 1.25 : 1.0;
  utterance.pitch = rage > 1.5 ? 1.15 : 1.0;

  // Add visual audio waves class pulse
  const waves = document.getElementById("audioWaves");
  if (waves) waves.classList.add("active");

  utterance.onend = () => {
    if (waves) waves.classList.remove("active");
  };

  speechSynthesis.speak(utterance);
}

function speakTest() {
  playSynthSound("chime");
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  
  const select = document.getElementById("voiceSelect");
  const selectedIndex = select.value;
  const utterance = new SpeechSynthesisUtterance("PitchPersona voice channel configured!");
  
  if (selectedIndex !== "default" && synthVoices[selectedIndex]) {
    utterance.voice = synthVoices[selectedIndex];
  }
  speechSynthesis.speak(utterance);
}

// 14. CUSTOM PERSONA LABORATORY (LocalStorage support)
function loadCustomPersonas() {
  try {
    const raw = localStorage.getItem("custom_personas");
    if (raw) {
      customPersonas = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse custom personas:", e);
  }
  renderCustomPersonasList();
}

function saveCustomPersona(event) {
  event.preventDefault();
  playSynthSound("chime");

  const name = document.getElementById("personaName").value.toUpperCase();
  const emoji = document.getElementById("personaEmoji").value;
  const team = document.getElementById("personaTeam").value;
  const vibe = document.getElementById("personaVibe").value;
  const catchphrasesRaw = document.getElementById("personaCatchphrases").value;

  const catchphrases = catchphrasesRaw.split(",")
    .map(x => x.trim())
    .filter(x => x.length > 0);

  if (catchphrases.length === 0) {
    alert("Please add at least 1 catchphrase!");
    return;
  }

  const newP = {
    id: `CUSTOM_${Date.now()}`,
    name: name,
    emoji: emoji,
    team: team,
    vibe: vibe,
    catchphrases: catchphrases
  };

  customPersonas.push(newP);
  localStorage.setItem("custom_personas", JSON.stringify(customPersonas));
  
  // Reset Form
  document.getElementById("customPersonaForm").reset();
  
  // Reload Grids & selectors
  loadCustomPersonas();
  renderPersonas();
  renderDebateSelectors();
  
  // Make active
  selectPersona(newP.id);
  alert(`🧬 Registered custom persona [${name}] successfully!`);
}

function renderCustomPersonasList() {
  const container = document.getElementById("customPersonasGrid");
  if (!container) return;
  container.innerHTML = "";

  if (customPersonas.length === 0) {
    container.innerHTML = `
      <div class="no-custom-personas">
        No custom personas created yet. Build one above to see it appear!
      </div>
    `;
    return;
  }

  customPersonas.forEach(p => {
    const card = document.createElement("div");
    card.className = "custom-persona-card";
    card.innerHTML = `
      <div class="custom-persona-info">
        <span class="custom-persona-emoji">${p.emoji}</span>
        <div class="custom-persona-details">
          <h4>${p.name}</h4>
          <p>Bias: ${p.team} | Style: ${p.vibe}</p>
        </div>
      </div>
      <button class="btn-delete-persona" onclick="deleteCustomPersona('${p.id}')" title="Delete Persona">🗑️</button>
    `;
    container.appendChild(card);
  });
}

function deleteCustomPersona(id) {
  playSynthSound("rumble");
  customPersonas = customPersonas.filter(x => x.id !== id);
  localStorage.setItem("custom_personas", JSON.stringify(customPersonas));
  
  // If active is deleted, fallback to default
  if (selectedPersona === id) {
    selectedPersona = "RCB FAN";
  }

  loadCustomPersonas();
  renderPersonas();
  renderDebateSelectors();
}

// 15. SETTINGS PANEL INTERACTION (API KEY CONFIG)
function saveSettings() {
  const apiKey = document.getElementById("apiKeyInput").value.trim();
  const model = document.getElementById("modelSelect").value;
  
  if (apiKey === "") {
    alert("Please enter a valid Gemini API Key!");
    return;
  }

  localStorage.setItem("gemini_api_key", apiKey);
  localStorage.setItem("gemini_model", model);

  playSynthSound("chime");
  updateAPIStatusBadge(true);
  alert("Settings saved successfully! True AI-generative mode unlocked!");
}

function clearSettings() {
  playSynthSound("rumble");
  localStorage.removeItem("gemini_api_key");
  document.getElementById("apiKeyInput").value = "";
  updateAPIStatusBadge(false);
  alert("Gemini API key cleared. Operating in Offline Simulation Mode.");
}

function updateAPIStatusBadge(hasKey) {
  const badge = document.getElementById("apiStatusDisplay");
  const statusText = badge.querySelector(".status-text");
  
  if (hasKey) {
    badge.className = "control-badge api-status-badge online";
    statusText.textContent = "LIVE GEMINI MODE";
  } else {
    badge.className = "control-badge api-status-badge offline";
    statusText.textContent = "OFFLINE GENERATOR";
  }
}

// Check key on boot
document.addEventListener("DOMContentLoaded", () => {
  const key = localStorage.getItem("gemini_api_key");
  const model = localStorage.getItem("gemini_model");
  
  if (key) {
    document.getElementById("apiKeyInput").value = key;
    if (model) document.getElementById("modelSelect").value = model;
    updateAPIStatusBadge(true);
  } else {
    updateAPIStatusBadge(false);
  }
});