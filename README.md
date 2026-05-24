# 🏏 PitchPersona AI — Cricket Commentary & Agentic Debate Arena

**PitchPersona AI** is a premium, hyper-immersive, cyber-themed single-page web application that brings the high-stakes emotional chaos of Indian Premier League (IPL) cricket fandom to life! Powered by a sophisticated **Local AI Emulator** and optional **Google Gemini API** integration, the app lets you experience stadium moments through the eyes of unique fan personalities, watch them debate each other in real-time, and monitor live tension analytics.

---

## 🚀 Key Features

### 1. 🎤 Live Fan Commentary
*   **Diverse Personas**: Choose between iconic archetypes like the hopeful **RCB Fan**, the calculated **CSK Fan**, the trophy-flexing **MI Fan**, the ruthless **Toxic Twitter keyboard warrior**, the empirical **Calm Analyst**, the laughing **Meme Lord**, or the TV-smashing **Angry Fan**.
*   **Rage Multiplier**: Adjust a tactile slider to scale commentary anger levels from `0.5x` (indifferent) to `3.0x` (screaming in all-caps).
*   **Meme Mode**: Inject internet-culture humor, Twitter spaces drama, and scriptwriter theories.

### 2. ⚔️ Multi-Agent Debate Arena
*   **Sequential Turn Simulation**: Pitch multiple fan agents into an interactive chat thread and trigger debates about controversial moments.
*   **Contextual Thread Awareness**: Each agent listens to the match trigger AND directly responds to the previous agent's points (e.g., MI Fans bragging about 5 trophies, RCB Fans complaining about loyalty, and Analysts trying to calm them down with standard deviations).
*   **Visual Bounces**: Includes glowing typing bubbles and interactive accent sounds as agents formulate their replies.

### 3. ⚡ Live IPL Ticker Simulator
*   **Automatic Match Feed**: Simulates a live scorecard (Runs, Wickets, Overs) with dramatic ball-by-ball announcements.
*   **Interactive Ticker logs**: Trigger manual plays or turn on the simulator loop.
*   **Auto-Debate Dispatcher**: If active, simulated match triggers instantly push directly to the selected debate panel, prompting the characters to argue automatically as the match unfolds!

### 4. 📊 Dynamic Stadium Stats Dashboard
*   **Win Probability Tracker**: Updates percentages (e.g., `80% - 20%`) reactively based on active commentators and event positive/negative weights.
*   **SVG Radial Gauges**: Glowing neon gauges plotting **Hype Factor** and **Fan Tension** adjusting dynamically via CSS and stroke-dashoffset formulas.
*   **Meme Caps & Trophy Tallies**: Shifting counters that keep track of stadium metrics like "RCB Hope" or "Meme Cap level".

### 5. 🧪 Custom Persona Laboratory
*   **DNA Constructor**: Design your own custom fan profiles specifying name, avatar emoji, team bias, vibe class, and customized catchphrases.
*   **LocalStorage Persistent**: Saved custom characters automatically compile in your commentary grid and participate in active debates across page reloads!

### 6. 🔊 Web Audio Synthesizer & Voice Speech Config
*   **Digital Sound Synth**: Synthesizes keyboard clicks, success chimes, and deep rumbles directly in-code using the native Web Audio API—completely asset-free.
*   **Text-to-Speech Readers**: Configures your browser's SpeechSynthesis engine to read out commentaries in local accents (Indian, British, American, etc.) to match the persona's speaking channel.

---

## 🛠️ Technology Stack
*   **Markup**: Semantic HTML5 structures.
*   **Styling**: Vanilla CSS3 (Neon gradients, keyframe animations, grid/flexbox layouts, responsive breakpoints).
*   **Logic**: Vanilla ES6+ JavaScript (Web Audio API, Speech Synthesis, LocalStorage, Fetch API).
*   **Optional AI**: Google Gemini Developer API integration.

---

## 🏃‍♂️ How to Run the Project
This project runs entirely **client-side** and has **zero server dependencies**. 

1.  Clone the repository:
    ```bash
    git clone https://github.com/shashwat05-stack/PitchPersona-AI.git
    ```
2.  Open [index.html](index.html) directly in any modern browser (Chrome, Edge, Safari, Firefox).
3.  Enjoy the local offline experience immediately!

---

## ⚙️ Unlocking Real Generative AI (Optional)
By default, the application runs on a robust, rule-based **Offline AI Simulation Engine** pre-loaded with thousands of stadium slang and dialogue combinations. 

To unlock true generative AI comments:
1.  Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2.  Open the app and navigate to the **Settings** (⚙️) tab.
3.  Paste your key, select your model (`gemini-1.5-flash` or `gemini-1.5-pro`), and click **Save Settings**.
4.  *Your key is saved 100% locally in your browser's secure `localStorage` and is only sent directly to Google's official API servers.*
