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

    const now = audioCtx.currentTime;

    if (type === "click") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "chime") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "rumble") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === "typing") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.02);
      osc.start(now);
      osc.stop(now + 0.02);
    } else if (type === "sad-trombone") {
      // Descending sad trombone slide (Wah-Wah-Wah-Waaaaah)
      const notes = [220, 207, 196, 174];
      notes.forEach((freq, idx) => {
        const tStart = now + idx * 0.26;
        const tEnd = tStart + (idx === 3 ? 0.6 : 0.23);
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sawtooth";

        osc.frequency.setValueAtTime(freq * 1.12, tStart);
        osc.frequency.exponentialRampToValueAtTime(freq, tStart + 0.15);
        if (idx === 3) {
          osc.frequency.linearRampToValueAtTime(freq * 0.95, tEnd);
        }

        gain.gain.setValueAtTime(0, tStart);
        gain.gain.linearRampToValueAtTime(0.12, tStart + 0.04);
        gain.gain.linearRampToValueAtTime(0, tEnd);

        osc.start(tStart);
        osc.stop(tEnd);
      });
    } else if (type === "airhorn") {
      // Detuned MLG Square-wave staccato blasts (Brap! Brap! Braaaaaap!)
      const blasts = [
        { start: 0, dur: 0.15 },
        { start: 0.18, dur: 0.15 },
        { start: 0.36, dur: 0.65 }
      ];
      blasts.forEach(b => {
        const tStart = now + b.start;
        const tEnd = tStart + b.dur;

        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(650, tStart);
        filter.Q.setValueAtTime(2.0, tStart);

        gain.connect(filter);
        filter.connect(audioCtx.destination);

        const freqs = [380, 384, 376];
        freqs.forEach(f => {
          const osc = audioCtx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(f, tStart);
          osc.frequency.linearRampToValueAtTime(f * 0.96, tEnd);
          osc.connect(gain);
          osc.start(tStart);
          osc.stop(tEnd);
        });

        gain.gain.setValueAtTime(0, tStart);
        gain.gain.linearRampToValueAtTime(0.18, tStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, tEnd);
      });
    } else if (type === "dun-dun-dun") {
      // Ominous dramatic bass hits (Dun... Dun... DUNNNN!)
      const hits = [
        { start: 0, freq: 110 },
        { start: 0.32, freq: 103 },
        { start: 0.64, freq: 82 }
      ];
      hits.forEach((h, idx) => {
        const tStart = now + h.start;
        const tEnd = tStart + (idx === 2 ? 0.8 : 0.28);

        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.type = "sawtooth";
        osc2.type = "triangle";

        osc1.frequency.setValueAtTime(h.freq, tStart);
        osc2.frequency.setValueAtTime(h.freq * 1.5, tStart);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        gain.gain.setValueAtTime(0, tStart);
        gain.gain.linearRampToValueAtTime(0.24, tStart + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, tEnd);

        osc1.start(tStart);
        osc1.stop(tEnd);
        osc2.start(tStart);
        osc2.stop(tEnd);
      });
    } else if (type === "boing") {
      // Fast spring jump pitch sweep
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.35);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "crickets") {
      // High-pitched awkward chirping
      const chirps = [0, 0.16, 0.32, 0.6, 0.76, 0.92];
      chirps.forEach(start => {
        const tStart = now + start;
        const tEnd = tStart + 0.09;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(4600, tStart);

        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.setValueAtTime(65, tStart);
        lfoGain.gain.setValueAtTime(350, tStart);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0, tStart);
        gain.gain.linearRampToValueAtTime(0.04, tStart + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, tEnd);

        lfo.start(tStart);
        lfo.stop(tEnd);
        osc.start(tStart);
        osc.stop(tEnd);
      });
    } else if (type === "explosion") {
      // White-noise sweep TV smash explosion
      const bufferSize = audioCtx.sampleRate * 1.6;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(65, now + 1.3);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start(now);
      noise.stop(now + 1.6);
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

    // Play funny meme sounds based on persona
    const eLower = eventText.toLowerCase();
    if (selectedPersona === "RCB FAN") {
      if (eLower.includes("duck") || eLower.includes("out") || eLower.includes("wicket") || eLower.includes("lost")) {
        playSynthSound("sad-trombone");
      } else {
        playSynthSound("airhorn");
      }
    } else if (selectedPersona === "CSK FAN" || selectedPersona === "MI FAN") {
      playSynthSound("airhorn");
    } else if (selectedPersona === "TOXIC TWITTER" || selectedPersona === "GAMBHIR DISCIPLE") {
      playSynthSound("dun-dun-dun");
    } else if (selectedPersona === "CALM ANALYST") {
      playSynthSound("crickets");
    } else if (selectedPersona === "MEME LORD") {
      playSynthSound("boing");
    } else if (selectedPersona === "ANGRY FAN") {
      playSynthSound("explosion");
    } else {
      playSynthSound("chime");
    }

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
    
    // Play funny sound based on character who just spoke
    if (speaker.id === "RCB FAN") {
      playSynthSound("sad-trombone");
    } else if (speaker.id === "CSK FAN" || speaker.id === "MI FAN") {
      playSynthSound("airhorn");
    } else if (speaker.id === "TOXIC TWITTER" || speaker.id === "GAMBHIR DISCIPLE") {
      playSynthSound("dun-dun-dun");
    } else if (speaker.id === "CALM ANALYST") {
      playSynthSound("crickets");
    } else if (speaker.id === "MEME LORD") {
      playSynthSound("boing");
    } else if (speaker.id === "ANGRY FAN") {
      playSynthSound("explosion");
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

/* ==========================================
   AI MATCH PREDICTOR ENGINE
   ========================================== */

// IPL Team Historical Data (Based on aggregate IPL stats)
const IPL_TEAM_DATA = {
  RCB:  { name: "Royal Challengers Bengaluru", emoji: "🔴", avgScore: 167, winRate: 0.48, chaseWinRate: 0.50, powerplayAvg: 52, deathAvg: 52, color: "#ff3e3e" },
  CSK:  { name: "Chennai Super Kings",         emoji: "💛", avgScore: 171, winRate: 0.60, chaseWinRate: 0.64, powerplayAvg: 51, deathAvg: 56, color: "#ffc400" },
  MI:   { name: "Mumbai Indians",              emoji: "💙", avgScore: 172, winRate: 0.59, chaseWinRate: 0.60, powerplayAvg: 53, deathAvg: 58, color: "#0088ff" },
  KKR:  { name: "Kolkata Knight Riders",       emoji: "💜", avgScore: 168, winRate: 0.55, chaseWinRate: 0.54, powerplayAvg: 52, deathAvg: 54, color: "#c300ff" },
  DC:   { name: "Delhi Capitals",              emoji: "🔵", avgScore: 166, winRate: 0.50, chaseWinRate: 0.48, powerplayAvg: 50, deathAvg: 52, color: "#0055ff" },
  PBKS: { name: "Punjab Kings",               emoji: "❤️", avgScore: 165, winRate: 0.48, chaseWinRate: 0.46, powerplayAvg: 54, deathAvg: 50, color: "#ff3c3c" },
  RR:   { name: "Rajasthan Royals",            emoji: "🩷", avgScore: 164, winRate: 0.51, chaseWinRate: 0.53, powerplayAvg: 49, deathAvg: 53, color: "#ff66aa" },
  SRH:  { name: "Sunrisers Hyderabad",         emoji: "🧡", avgScore: 173, winRate: 0.52, chaseWinRate: 0.51, powerplayAvg: 56, deathAvg: 55, color: "#ff6600" },
  GT:   { name: "Gujarat Titans",             emoji: "🟡", avgScore: 170, winRate: 0.56, chaseWinRate: 0.55, powerplayAvg: 50, deathAvg: 57, color: "#ddcc00" },
  LSG:  { name: "Lucknow Super Giants",        emoji: "🩵", avgScore: 165, winRate: 0.51, chaseWinRate: 0.50, powerplayAvg: 49, deathAvg: 52, color: "#00ccff" },
};

// Venue factors
const VENUE_FACTOR = {
  neutral: { batting: 0, bowling: 0 },
  batting:  { batting: +8, bowling: -4 },
  bowling:  { batting: -8, bowling: +4 },
  spin:     { batting: -4, bowling: +6 }
};

// Conditions factor
const CONDITIONS_FACTOR = {
  clear:    { batting: 0, chasing: 0 },
  overcast: { batting: -4, chasing: -2 },
  dew:      { batting: 0,  chasing: +8 }
};

// Toss factors
const TOSS_WIN_BOOST = { batting_won: +4, bowling_won: +3, unknown: 0 };

function toggleTargetField() {
  const innings = document.getElementById("predInnings").value;
  const targetGroup = document.getElementById("predTargetGroup");
  if (innings === "2") {
    targetGroup.style.display = "flex";
  } else {
    targetGroup.style.display = "none";
  }
  liveUpdatePrediction();
}

function handleFormatChange() {
  liveUpdatePrediction();
}

function updatePredictorTeams() {
  liveUpdatePrediction();
}

function liveUpdatePrediction() {
  // If core values are filled, run quietly in background
  const score = parseInt(document.getElementById("predScore").value);
  const overs = parseFloat(document.getElementById("predOvers").value);
  if (!isNaN(score) && !isNaN(overs) && overs > 0) {
    // Silently run and update (no animation noise)
  }
}

function runMatchPrediction() {
  const battingTeamId = document.getElementById("predBattingTeam").value;
  const bowlingTeamId = document.getElementById("predBowlingTeam").value;
  const format        = document.getElementById("predFormat").value;
  const innings       = parseInt(document.getElementById("predInnings").value);
  const score         = parseInt(document.getElementById("predScore").value) || 0;
  const wickets       = parseInt(document.getElementById("predWickets").value) || 0;
  const overs         = parseFloat(document.getElementById("predOvers").value) || 0;
  const target        = parseInt(document.getElementById("predTarget").value) || 0;
  const venue         = document.getElementById("predVenue").value;
  const toss          = document.getElementById("predToss").value;
  const conditions    = document.getElementById("predConditions").value;

  // Validate inputs
  if (!battingTeamId || !bowlingTeamId) {
    alert("Please select both Batting and Bowling teams!");
    return;
  }
  if (battingTeamId === bowlingTeamId) {
    alert("Batting and Bowling teams cannot be the same!");
    return;
  }
  if (overs <= 0) {
    alert("Please enter overs completed (greater than 0)!");
    return;
  }
  if (innings === 2 && target <= 0) {
    alert("Please enter the target score for a 2nd innings chase!");
    return;
  }

  // Animate the predict button
  const btn = document.getElementById("predictBtn");
  btn.textContent = "⚙️ COMPUTING...";
  btn.disabled = true;
  playSynthSound("dun-dun-dun");

  setTimeout(() => {
    const result = computePrediction(battingTeamId, bowlingTeamId, format, innings, score, wickets, overs, target, venue, toss, conditions);
    renderPredictionResults(result, battingTeamId, bowlingTeamId);
    
    btn.textContent = "🔮 PREDICT MATCH OUTCOME";
    btn.disabled = false;
    playSynthSound("chime");

    // Scroll to results
    document.getElementById("predictionResults").scrollIntoView({ behavior: "smooth" });
  }, 1200);
}

function computePrediction(battingId, bowlingId, format, innings, score, wickets, overs, target, venue, toss, conditions) {
  const batTeam = IPL_TEAM_DATA[battingId];
  const bowlTeam = IPL_TEAM_DATA[bowlingId];
  const maxOvers = format === "T20" ? 20 : 50;

  const oversRemaining = maxOvers - overs;
  const wicketsInHand = 10 - wickets;
  const currentRR = overs > 0 ? score / overs : 0;

  // ---- Base score projection ----
  // Wicket-in-hand momentum factor (more wickets = higher potential)
  const wicketFactor = wicketsInHand / 10;

  // Phase acceleration factor for T20
  let phaseFactor = 1.0;
  if (format === "T20") {
    if (overs <= 6)       phaseFactor = 1.35; // powerplay acceleration ahead
    else if (overs <= 15) phaseFactor = 1.15; // middle overs rise
    else                  phaseFactor = 1.45; // death overs surge
  } else {
    if (overs <= 10)      phaseFactor = 1.20;
    else if (overs <= 40) phaseFactor = 1.10;
    else                  phaseFactor = 1.30;
  }

  // Team batting strength vs bowling strength ratio
  const teamStrengthRatio = batTeam.avgScore / bowlTeam.avgScore;

  // Venue and conditions modifiers
  const venueBonus  = VENUE_FACTOR[venue].batting;
  const condBonus   = CONDITIONS_FACTOR[conditions].batting;
  const tossBonus   = TOSS_WIN_BOOST[toss];

  // Projected additional runs
  const baseProjectionRate = currentRR * phaseFactor * wicketFactor * teamStrengthRatio;
  const additionalRuns = Math.round(baseProjectionRate * oversRemaining);
  const projectedTotal  = score + additionalRuns + venueBonus + condBonus + Math.round(tossBonus * 0.5);
  const projectedClamped = Math.max(projectedTotal, score + 5);

  // ---- Win Probability Computation ----
  let battingWinProbability = 50;

  if (innings === 1) {
    // 1st innings: batting team wins if they set a big enough target
    const avgTarget = format === "T20" ? 171 : 270;
    const progressScore = projectedClamped;
    const surplus = progressScore - avgTarget;
    battingWinProbability = 50 + Math.min(Math.max(surplus * 0.6, -35), 40);

    // Wickets penalty
    battingWinProbability -= Math.max((wickets - 3) * 4, 0);

    // Overs remaining factor
    if (oversRemaining < 3 && format === "T20") {
      battingWinProbability = score > avgTarget - 5 ? 60 : 42;
    }
  } else {
    // 2nd innings chase: compute RRR
    const runsNeeded = target - score;
    const rrr = oversRemaining > 0 ? runsNeeded / oversRemaining : 99;

    // Base win probability from RRR vs current RR
    const rrrRatio = currentRR / Math.max(rrr, 0.1);
    battingWinProbability = 50 + ((rrrRatio - 1) * 30);

    // Wickets in hand penalty
    if (wicketsInHand <= 3) battingWinProbability -= 20;
    else if (wicketsInHand <= 5) battingWinProbability -= 8;

    // Dew factor boost for chasing
    if (conditions === "dew") battingWinProbability += 8;

    // Already won / already lost handling
    if (runsNeeded <= 0) {
      battingWinProbability = 100; // Batting team won
    } else if (wicketsInHand === 0 || oversRemaining <= 0) {
      battingWinProbability = 0; // Bowling team won
    }
  }

  // Team historical win rate modifiers
  battingWinProbability += (batTeam.winRate - 0.5) * 15;
  battingWinProbability -= (bowlTeam.winRate - 0.5) * 15;

  // Chase-specific modifier
  if (innings === 2) {
    battingWinProbability += (batTeam.chaseWinRate - 0.5) * 12;
  }

  // Toss final boost
  battingWinProbability += (toss === "batting_won") ? 3 : (toss === "bowling_won") ? -3 : 0;

  // Clamp to 5–95
  battingWinProbability = Math.min(Math.max(Math.round(battingWinProbability), 5), 95);
  const bowlingWinProbability = 100 - battingWinProbability;

  // Confidence level
  const probDiff = Math.abs(battingWinProbability - bowlingWinProbability);
  let confidence = "LOW";
  if (probDiff >= 30) confidence = "HIGH";
  else if (probDiff >= 15) confidence = "MEDIUM";

  // Required run rate for 2nd innings
  const runsNeeded = innings === 2 ? Math.max(target - score, 0) : 0;
  const rrr = (innings === 2 && oversRemaining > 0) ? (runsNeeded / oversRemaining).toFixed(2) : "N/A";

  return {
    battingWinProbability,
    bowlingWinProbability,
    projectedTotal: projectedClamped,
    confidence,
    currentRR: currentRR.toFixed(2),
    rrr,
    wicketsInHand,
    oversRemaining: oversRemaining.toFixed(1),
    runsNeeded,
    innings,
    target,
    score,
    wickets,
    overs,
    format,
    venue,
    toss,
    conditions
  };
}

function renderPredictionResults(result, battingId, bowlingId) {
  const panel = document.getElementById("predictionResults");
  const batTeam = IPL_TEAM_DATA[battingId];
  const bowlTeam = IPL_TEAM_DATA[bowlingId];

  // 1. Winner Banner
  const winner = result.battingWinProbability >= 50 ? batTeam : bowlTeam;
  document.getElementById("predWinnerName").textContent = `${winner.emoji} ${winner.name}`;
  
  const confBadge = document.getElementById("predConfidenceBadge");
  confBadge.textContent = `${result.confidence} CONFIDENCE`;
  confBadge.className = `pred-confidence-badge ${result.confidence.toLowerCase()}`;

  // 2. Win Probability Bar
  document.getElementById("predTeamALabel").textContent = `${batTeam.emoji} ${batTeam.name}`;
  document.getElementById("predTeamBLabel").textContent = `${bowlTeam.emoji} ${bowlTeam.name}`;
  document.getElementById("predProbFillA").style.width = `${result.battingWinProbability}%`;
  document.getElementById("predProbFillB").style.width = `${result.bowlingWinProbability}%`;
  document.getElementById("predPctA").textContent = `${result.battingWinProbability}%`;
  document.getElementById("predPctB").textContent = `${result.bowlingWinProbability}%`;

  // 3. Key Metrics Grid
  const metricsGrid = document.getElementById("predMetricsGrid");
  metricsGrid.innerHTML = "";

  const metrics = [
    {
      icon: "📊", label: "CURRENT RUN RATE",
      val: result.currentRR,
      cls: parseFloat(result.currentRR) >= 8 ? "positive" : parseFloat(result.currentRR) >= 6 ? "warning" : "danger"
    },
    {
      icon: "🎯", label: result.innings === 2 ? "REQUIRED RUN RATE" : "PROJECTED RR",
      val: result.innings === 2 ? result.rrr : (result.projectedTotal / 20).toFixed(1),
      cls: result.innings === 2 ? (parseFloat(result.rrr) <= 8 ? "positive" : parseFloat(result.rrr) <= 11 ? "warning" : "danger") : "positive"
    },
    {
      icon: "🎳", label: "WICKETS IN HAND",
      val: result.wicketsInHand,
      cls: result.wicketsInHand >= 6 ? "positive" : result.wicketsInHand >= 3 ? "warning" : "danger"
    },
    {
      icon: "⏱️", label: "OVERS REMAINING",
      val: result.oversRemaining,
      cls: parseFloat(result.oversRemaining) >= 8 ? "positive" : parseFloat(result.oversRemaining) >= 4 ? "warning" : "danger"
    },
    ...(result.innings === 2 ? [{
      icon: "🏹", label: "RUNS NEEDED",
      val: result.runsNeeded,
      cls: result.runsNeeded <= 20 ? "positive" : result.runsNeeded <= 60 ? "warning" : "danger"
    }] : []),
    {
      icon: "🏏", label: `${batTeam.name.split(" ")[0].toUpperCase()} AVG SCORE`,
      val: batTeam.avgScore,
      cls: "positive"
    }
  ];

  metrics.forEach(m => {
    const box = document.createElement("div");
    box.className = "pred-metric-box";
    box.innerHTML = `
      <div class="pred-metric-icon">${m.icon}</div>
      <div class="pred-metric-val ${m.cls}">${m.val}</div>
      <div class="pred-metric-lbl">${m.label}</div>
    `;
    metricsGrid.appendChild(box);
  });

  // 4. Projection Card
  const projTitle = document.getElementById("predProjectionTitle");
  const projVal = document.getElementById("predProjectionValue");
  const projSub = document.getElementById("predProjectionSub");

  if (result.innings === 1) {
    projTitle.textContent = "PROJECTED FINAL SCORE";
    projVal.textContent = `${result.projectedTotal}`;
    projSub.textContent = `${batTeam.name} may finish around ${result.projectedTotal - 5}–${result.projectedTotal + 10} at current trajectory`;
  } else {
    projTitle.textContent = "CHASE EQUATION";
    projVal.textContent = `${result.runsNeeded} off ${result.oversRemaining} Overs`;
    projSub.textContent = `Required Run Rate: ${result.rrr} per over | Wickets In Hand: ${result.wicketsInHand}`;
  }

  // 5. AI Analysis Text
  const analysis = generateAIAnalysis(result, batTeam, bowlTeam);
  document.getElementById("predAnalysisText").textContent = analysis;

  // 6. Critical Turning Points Timeline
  const timeline = document.getElementById("predTimeline");
  timeline.innerHTML = "";
  const turning_points = generateTurningPoints(result, batTeam, bowlTeam);
  turning_points.forEach(tp => {
    const item = document.createElement("div");
    item.className = "pred-timeline-item";
    item.innerHTML = `
      <div class="pred-timeline-dot ${tp.type}"></div>
      <div class="pred-timeline-content">
        <h5>${tp.title}</h5>
        <p>${tp.desc}</p>
      </div>
    `;
    timeline.appendChild(item);
  });

  // Show panel
  panel.style.display = "flex";

  // Update sidebar focus
  document.getElementById("sidebarFocusEvent").textContent = 
    `Predicting: ${batTeam.name} vs ${bowlTeam.name} | ${result.score}/${result.wickets} in ${result.overs} overs`;
  
  // Update analytics dashboard win probability
  updateAnalyticsDashboard(
    `${batTeam.name} batting, ${result.battingWinProbability}% win probability`,
    battingId
  );
}

function generateAIAnalysis(result, batTeam, bowlTeam) {
  const crr = parseFloat(result.currentRR);
  const rrr = parseFloat(result.rrr);

  if (result.innings === 1) {
    let analysis = `🏏 1st INNINGS ANALYSIS — ${batTeam.name} vs ${bowlTeam.name}\n\n`;
    analysis += `Current scorecard: ${result.score}/${result.wickets} after ${result.overs} overs (${result.format}).\n\n`;
    analysis += `At a run rate of ${result.currentRR}, ${batTeam.name} are projecting toward a final total of approximately ${result.projectedTotal} runs. `;

    if (result.projectedTotal >= bowlTeam.avgScore + 10) {
      analysis += `This would be a challenging total that would test ${bowlTeam.name}'s batting depth significantly. `;
    } else if (result.projectedTotal < bowlTeam.avgScore - 10) {
      analysis += `However, this may prove to be an under-par target given ${bowlTeam.name}'s historically strong batting lineup. `;
    } else {
      analysis += `This is a competitive and par total that sets up an extremely interesting contest. `;
    }

    if (result.wicketsInHand >= 7) {
      analysis += `\n\nWith ${result.wicketsInHand} wickets still in hand, ${batTeam.name} have enough firepower to accelerate aggressively in the death overs. `;
    } else if (result.wicketsInHand <= 3) {
      analysis += `\n\nHowever, with only ${result.wicketsInHand} wickets remaining, they will need to bat extremely carefully to avoid a dramatic collapse. `;
    }

    analysis += `\n\n📋 MATCHUP NOTE: Historical data places ${batTeam.name}'s average score at ${batTeam.avgScore} while ${bowlTeam.name} typically restricts opponents to around their bowling average. Win probability model currently favors ${result.battingWinProbability >= 50 ? batTeam.name : bowlTeam.name} at ${Math.max(result.battingWinProbability, result.bowlingWinProbability)}%.`;
    return analysis;
  } else {
    // 2nd innings
    let analysis = `🎯 CHASE ANALYSIS — ${batTeam.name} need ${result.runsNeeded} off ${result.oversRemaining} overs\n\n`;

    if (rrr <= 6) {
      analysis += `The target is well within reach! At a required run rate of just ${rrr}, ${batTeam.name} are heavy favourites to complete this chase comfortably. `;
    } else if (rrr <= 8) {
      analysis += `This is a competitive chase. A required rate of ${rrr} is achievable but demands sustained focus and no major collapses. `;
    } else if (rrr <= 11) {
      analysis += `Under significant pressure! ${batTeam.name} need ${rrr} runs per over — this demands immediate acceleration from the batting lineup and no further wicket losses. `;
    } else {
      analysis += `Extremely high required rate of ${rrr} per over! This is mathematically possible but highly unlikely without a monumental batting performance. `;
    }

    if (result.wicketsInHand <= 3) {
      analysis += `\n\nCRITICAL: With only ${result.wicketsInHand} wicket(s) remaining, the tail is exposed and the pressure is immense on surviving batters. `;
    } else if (result.wicketsInHand >= 7) {
      analysis += `\n\nWith ${result.wicketsInHand} wickets in hand, ${batTeam.name} have excellent depth to mount a successful chase if momentum stays with them. `;
    }

    if (result.conditions === "dew") {
      analysis += `\n\n☁️ DEW FACTOR: Heavy dew on the outfield is expected to significantly assist the chasing batting side — grip on the ball will be compromised, making bowling harder and boundaries more frequent. `;
    }

    analysis += `\n\n📋 MATCHUP NOTE: ${batTeam.name} historically chase with a ${Math.round(batTeam.chaseWinRate * 100)}% success rate versus ${bowlTeam.name}'s ${Math.round((1 - batTeam.chaseWinRate) * 100)}% win rate when defending this kind of target.`;
    return analysis;
  }
}

function generateTurningPoints(result, batTeam, bowlTeam) {
  const points = [];
  const rrr = parseFloat(result.rrr);

  if (result.innings === 1) {
    points.push({
      type: result.wicketsInHand >= 6 ? "positive" : "negative",
      title: "BATTING DEPTH ASSESSMENT",
      desc: `${batTeam.name} have ${result.wicketsInHand} wickets in hand with ${result.oversRemaining} overs left — ${result.wicketsInHand >= 6 ? "strong position to launch in the death overs" : "fragile batting tail exposed, risk of collapse"}.`
    });

    if (result.conditions === "overcast") {
      points.push({ type: "warning", title: "OVERCAST CONDITIONS", desc: "Overcast skies are assisting the new ball swing. Expect more seam movement — batting becomes harder as balls skip off the deck." });
    }

    points.push({
      type: parseFloat(result.currentRR) >= 7.5 ? "positive" : "warning",
      title: "CURRENT MOMENTUM",
      desc: `Run rate of ${result.currentRR} per over. ${parseFloat(result.currentRR) >= 8.5 ? "Team is on fire — excellent platform for a mammoth total." : "Slightly below par. Death overs will be crucial to get to a competitive total."}`
    });

    points.push({
      type: "warning",
      title: "DEATH OVER EXECUTION",
      desc: `${batTeam.name}'s average in the death overs is ${batTeam.deathAvg} runs per 5 overs. Key finishers must step up to take the total above par.`
    });
  } else {
    // 2nd innings turning points
    points.push({
      type: rrr <= 8 ? "positive" : rrr <= 11 ? "warning" : "negative",
      title: "REQUIRED RUN RATE PRESSURE",
      desc: `Needing ${result.rrr} runs per over — ${rrr <= 8 ? "manageable with aggressive intent from set batters" : rrr <= 11 ? "high pressure situation requiring immediate sixes" : "near-impossible without multiple boundaries every over"}.`
    });

    points.push({
      type: result.wicketsInHand >= 5 ? "positive" : "negative",
      title: "WICKETS IN HAND",
      desc: `${result.wicketsInHand} wickets remaining. ${result.wicketsInHand >= 6 ? "Plenty of resources — can afford calculated aggression" : result.wicketsInHand >= 3 ? "Moderate risk exposure — need careful rotation with bursts of boundaries" : "Critical — tail-enders must survive and support the lower order hitters"}.`
    });

    if (result.conditions === "dew") {
      points.push({ type: "positive", title: "DEW ADVANTAGE", desc: "Dew conditions strongly favor the batting side in 2nd innings — outfield slows the ball and grip becomes difficult for bowlers. Expect more boundaries." });
    }

    points.push({
      type: result.battingWinProbability >= 60 ? "positive" : result.battingWinProbability >= 40 ? "warning" : "negative",
      title: "HISTORICAL HEAD-TO-HEAD",
      desc: `${batTeam.name} have a ${Math.round(batTeam.chaseWinRate * 100)}% chase win rate. ${batTeam.chaseWinRate >= 0.55 ? "Known as strong chasers — experience favors them" : "Known to struggle in pressure chases — bowling side has historical edge"}.`
    });
  }

  return points;
}
