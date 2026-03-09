import React from 'react';
import { StyleSheet, View, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const htmlContent = `<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cognitive Test - MockMentor AI</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+DQogIDxkZWZzPg0KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPg0KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzYzNjZmMTtzdG9wLW9wYWNpdHk6MSIgLz4NCiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2E4NTVmNztzdG9wLW9wYWNpdHk6MSIgLz4NCiAgICA8L2xpbmVhckdyYWRpZW50Pg0KICA8L2RlZnM+DQogIDxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9InVybCgjZ3JhZDEpIi8+DQogIDx0ZXh0IHg9IjUwIiB5PSI3MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI5MDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NPC90ZXh0Pg0KPC9zdmc+DQo=" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap");

        body {
            font-family: "Inter", sans-serif;
            background: #0f172a;
            color: white;
            overflow-x: hidden;
        }

        .glass-panel {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>

<body class="min-h-screen relative flex flex-col items-center justify-center p-4">
    <canvas id="neuralCanvas" class="fixed top-0 left-0 w-full h-full -z-10"></canvas>

    <!-- Anti-Cheat Violation Box -->
    <div id="violationWarnings" class="fixed top-4 right-4 z-50 flex flex-col gap-2"></div>

    <div class="glass-panel w-full max-w-3xl rounded-3xl p-6 md:p-10 relative overflow-hidden">
        <!-- Header -->
        <div class="text-center mb-8">
            <div
                class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 mb-4 border border-cyan-500/30">
                <i data-lucide="brain" class="w-8 h-8"></i>
            </div>
            <h1 class="text-3xl font-extrabold mb-2">Stage 1: Cognitive Reasoning</h1>
            <p class="text-gray-400">Answer these 10 rapid-fire questions to test your logical aptitude.</p>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-800 rounded-full h-2 mb-8 border border-white/5 overflow-hidden">
            <div id="progressBar"
                class="bg-gradient-to-r from-cyan-400 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style="width: 0%"></div>
        </div>

        <!-- Questions Container -->
        <form id="quizForm" class="space-y-6">
            <!-- Injected via JS -->
        </form>

        <!-- Submit Button -->
        <div class="mt-10 flex justify-end hidden" id="submitBtnContainer">
            <button type="button" onclick="submitCognitiveTest()"
                class="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-cyan-500/20 flex items-center gap-2">
                Submit & Continue to Coding <i data-lucide="arrow-right" class="w-5 h-5"></i>
            </button>
        </div>
    </div>

    <script>
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Background Canvas
        const canvas = document.getElementById("neuralCanvas");
        const ctx = canvas.getContext("2d");
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.age = 0;
                this.life = 200 + Math.random() * 100;
            }
            update() {
                this.x += this.vx; this.y += this.vy; this.age++;
                if (this.age > this.life || this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
            }
            draw() {
                ctx.fillStyle = \`rgba(6, 182, 212, \${0.3 * (1 - this.age / this.life)})\`;
                ctx.fillRect(this.x, this.y, 2, 2);
            }
        }
        const particles = Array(80).fill().map(() => new Particle());
        function loop() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(loop);
        }
        loop();

        // The Questions From Enigmacrash
        const COGNITIVE_POOL = [
            { question: "What comes next? 2, 6, 12, 20, ?", options: ["28", "30", "26", "32"], answer: "30" },
            { question: "If A=1, B=2, C=3, what is CAT?", options: ["24", "20", "15", "10"], answer: "24" },
            { question: "Find odd one: Apple, Mango, Carrot, Banana", options: ["Apple", "Carrot", "Banana", "Mango"], answer: "Carrot" },
            { question: "Clock angle at 3:15?", options: ["0°", "7.5°", "15°", "30°"], answer: "7.5°" },
            { question: "2x = 10, x=?", options: ["5", "10", "2", "20"], answer: "5" },
            { question: "Shape with 8 sides?", options: ["Hexagon", "Octagon", "Pentagon", "Heptagon"], answer: "Octagon" },
            { question: "15% of 200?", options: ["25", "30", "35", "40"], answer: "30" },
            { question: "3, 9, 27, ?", options: ["54", "81", "72", "63"], answer: "81" },
            { question: "ALL BLOOPS are RAZZIES. Are BLOOPS LUPPIES?", options: ["Yes", "No", "Cannot Determine", "Sometimes"], answer: "Yes" },
            { question: "12 × 12?", options: ["124", "144", "132", "154"], answer: "144" }
        ];

        // Randomize and pick 10
        const questions = COGNITIVE_POOL.sort(() => 0.5 - Math.random()).slice(0, 10);
        const quizForm = document.getElementById('quizForm');

        let currentQList = 0;
        let cognitiveScore = 0;

        function renderQuestions() {
            quizForm.innerHTML = questions.map((q, idx) => \`
        <div class="bg-slate-800/50 border border-white/5 rounded-2xl p-6 shadow-sm card-question \${idx === 0 ? '' : 'hidden'}" id="qblock-\${idx}">
          <p class="font-semibold text-lg mb-4 text-cyan-50">
            <span class="text-cyan-400 mr-2">Q\${idx + 1}/\${questions.length}:</span> \${q.question}
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            \${q.options.map(opt => \`
              <label id="label-\${idx}-\${opt.replace(/[^a-zA-Z0-9]/g, '')}" class="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition">
                <input type="radio" name="q\${idx}" value="\${opt}" class="w-4 h-4 text-cyan-500 bg-slate-700 border-white/20 focus:ring-cyan-500 focus:ring-offset-slate-900" onchange="enableEvaluateBtn(\${idx})">
                <span class="text-sm text-gray-300 pointer-events-none">\${opt}</span>
              </label>
            \`).join('')}
          </div>

          <!-- Feedback Area -->
          <div id="feedback-\${idx}" class="hidden p-4 rounded-xl mb-4 border text-sm font-semibold"></div>

          <!-- Controls -->
          <div class="flex justify-end gap-3">
              <button type="button" id="evalBtn-\${idx}" onclick="evaluateQuestion(\${idx})" class="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  <i data-lucide="check-circle" class="w-4 h-4"></i> Evaluate Answer
              </button>
              <button type="button" id="nextBtn-\${idx}" onclick="nextQuestion()" class="hidden bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 text-white">
                  Next <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
          </div>
        </div>
      \`).join('');
            if (window.lucide) window.lucide.createIcons();
        }

        function enableEvaluateBtn(idx) {
            document.getElementById(\`evalBtn-\${idx}\`).disabled = false;
        }

        function evaluateQuestion(idx) {
            const selected = document.querySelector(\`input[name="q\${idx}"]:checked\`);
            if (!selected) return;
            const userAns = selected.value;
            const correctAns = questions[idx].answer;

            // Lock all radios for this question
            document.querySelectorAll(\`input[name="q\${idx}"]\`).forEach(el => el.disabled = true);
            document.getElementById(\`evalBtn-\${idx}\`).classList.add('hidden');

            const isCorrect = userAns === correctAns;
            if (isCorrect) cognitiveScore++;

            // Highlight chosen label
            const chosenLabelId = \`label-\${idx}-\${userAns.replace(/[^a-zA-Z0-9]/g, '')}\`;
            const labelEl = document.getElementById(chosenLabelId);

            // Show Feedback Box
            const fbBox = document.getElementById(\`feedback-\${idx}\`);
            fbBox.classList.remove('hidden');

            if (isCorrect) {
                if (labelEl) {
                    labelEl.classList.remove('border-white/10', 'hover:border-cyan-500/50');
                    labelEl.classList.add('border-green-500', 'bg-green-500/20');
                }
                fbBox.classList.add('border-green-500', 'bg-green-500/10', 'text-green-400');
                fbBox.innerHTML = \`<i data-lucide="check" class="w-5 h-5 inline mr-2 hidden"></i> Correct! Brilliant logic.\`;
            } else {
                if (labelEl) {
                    labelEl.classList.remove('border-white/10', 'hover:border-cyan-500/50');
                    labelEl.classList.add('border-red-500', 'bg-red-500/20');
                }
                fbBox.classList.add('border-red-500', 'bg-red-500/10', 'text-red-400');
                fbBox.innerHTML = \`<i data-lucide="x" class="w-5 h-5 inline mr-2 hidden"></i> Incorrect. The correct answer was: <strong>\${correctAns}</strong>\`;
            }

            // Show Next Button
            if (idx === questions.length - 1) {
                document.getElementById('submitBtnContainer').classList.remove('hidden');
            } else {
                document.getElementById(\`nextBtn-\${idx}\`).classList.remove('hidden');
            }

            updateProgress();
        }

        function nextQuestion() {
            document.getElementById(\`qblock-\${currentQList}\`).classList.add('hidden');
            currentQList++;
            document.getElementById(\`qblock-\${currentQList}\`).classList.remove('hidden');
        }

        function updateProgress() {
            const total = questions.length;
            const answered = currentQList + 1; // Since they must evaluate to proceed
            const percent = (answered / total) * 100;
            document.getElementById('progressBar').style.width = percent + '%';
        }

        renderQuestions();

        // --- SUBMIT LOGIC ---
        function submitCognitiveTest() {
            // We already tracked score during evaluation
            const cognitivePercent = (cognitiveScore / questions.length) * 100;

            // Save state and move to coding test
            localStorage.setItem("cognitive_percent", cognitivePercent);
            localStorage.setItem("cognitive_violations", violationCount);

            window.location.href = "coding_test.html";
        }
    </script>
    <script>// ============================================
// helpdesk.js - Universal Floating AI Tutor
// ============================================

// 1. Core Styles
const styles = \`
  /* Help Desk Floating Button */
  #mockmentor-help-btn {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ec4899, #8b5cf6);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 25px rgba(236, 72, 153, 0.4);
    cursor: pointer;
    z-index: 99999;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  #mockmentor-help-btn:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 15px 35px rgba(236, 72, 153, 0.6);
  }

  #mockmentor-help-btn svg {
    width: 28px;
    height: 28px;
    transition: transform 0.3s;
  }

  #mockmentor-help-btn:hover svg {
    transform: rotate(15deg) scale(1.1);
  }

  /* Help Desk Chat Window */
  #mockmentor-help-window {
    position: fixed;
    bottom: 96px;
    right: 24px;
    width: 350px;
    height: 500px;
    max-height: 80vh;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
    display: flex;
    flex-direction: column;
    z-index: 99998;
    overflow: hidden;
    transform-origin: bottom right;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s;
    opacity: 0;
    pointer-events: none;
    transform: scale(0.8) translateY(20px);
  }

  #mockmentor-help-window.active {
    opacity: 1;
    pointer-events: all;
    transform: scale(1) translateY(0);
  }

  /* Chat Header */
  .mm-help-header {
    background: linear-gradient(to right, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1));
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mm-help-title {
    color: white;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mm-help-title span {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 10px #10b981;
    animation: mm-pulse 2s infinite;
  }

  @keyframes mm-pulse {
    0% { opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
    70% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
    100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  }

  .mm-close-btn {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
  }

  .mm-close-btn:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  /* Chat Body */
  .mm-chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  .mm-chat-body::-webkit-scrollbar { width: 6px; }
  .mm-chat-body::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 6px; }

  .mm-msg {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    font-family: "Inter", sans-serif;
    word-wrap: break-word;
    animation: mm-fade-in 0.3s ease-out forwards;
  }

  @keyframes mm-fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .mm-msg-ai {
    background: rgba(139, 92, 246, 0.15);
    border: 1px solid rgba(139, 92, 246, 0.3);
    color: #e2e8f0;
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  }

  .mm-msg-user {
    background: #ec4899;
    color: white;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
  }

  .mm-msg-code {
    background: #0f172a;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 8px;
    font-family: monospace;
    font-size: 12px;
    margin-top: 8px;
    overflow-x: auto;
    color: #a5b4fc;
  }

  /* Chat Input */
  .mm-chat-input-area {
    padding: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(15, 23, 42, 0.6);
    display: flex;
    gap: 8px;
  }

  .mm-chat-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 10px 14px;
    color: white;
    font-family: "Inter", sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }

  .mm-chat-input:focus {
    border-color: #ec4899;
    background: rgba(255, 255, 255, 0.1);
  }

  .mm-chat-send {
    background: #ec4899;
    border: none;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
  }

  .mm-chat-send:hover {
    background: #db2777;
    transform: scale(1.05);
  }

  .mm-typing-indicator {
    display: flex;
    gap: 4px;
    padding: 4px 8px;
  }

  .mm-dot {
    width: 6px;
    height: 6px;
    background: #a5b4fc;
    border-radius: 50%;
    animation: mm-bounce 1.4s infinite ease-in-out both;
  }

  .mm-dot:nth-child(1) { animation-delay: -0.32s; }
  .mm-dot:nth-child(2) { animation-delay: -0.16s; }

  @keyframes mm-bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
\`;

// 2. Inject CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// 3. Inject HTML
const helpDeskHTML = \`
  <!-- Floating Button -->
  <div id="mockmentor-help-btn" onclick="toggleHelpWindow()">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0 0 12 22z"></path>
      <circle cx="12" cy="11" r="1"></circle>
      <path d="M12 11v-1a2 2 0 1 1 2 2 2 2 0 0 0-2 2v1"></path>
    </svg>
  </div>

  <!-- Chat Window -->
  <div id="mockmentor-help-window">
    <div class="mm-help-header">
      <div class="mm-help-title"><span></span> AI Help Desk</div>
      <button class="mm-close-btn" onclick="toggleHelpWindow()">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    
    <div class="mm-chat-body" id="mm-chat-body">
      <div class="mm-msg mm-msg-ai">
        Hi there! 👋 I am the MockMentor Help Desk AI. 
        <br><br>
        If you are stuck on a concept, completely lost, or just need a hint on how to solve this, ask me anything! I am here to help you learn, not just test you.
      </div>
    </div>

    <div class="mm-chat-input-area">
      <input type="text" id="mm-chat-input" class="mm-chat-input" placeholder="Ask for a hint or solution..." onkeypress="handleMmKeyPress(event)" />
      <button class="mm-chat-send" onclick="sendMmMessage()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      </button>
    </div>
  </div>
\`;

const container = document.createElement('div');
container.innerHTML = helpDeskHTML;
document.body.appendChild(container);

// 4. Logic & State
let mmChatHistory = [];
const SYSTEM_PROMPT = \`You are the MockMentor AI Help Desk Tutor. 
The user is currently taking a technical interview or assessment on the MockMentor platform. 
They have opened this Help Desk widget because they are stuck, confused, or want to learn a concept.
Your job is to be extremely supportive, friendly, and educational.
If they ask for a hint, give them a breadcrumb.
If they ask for the exact solution or code because they gave up, PROVIDE IT TO THEM clearly with well-commented code blocks! 
We DO NOT want them leaving the platform to Google it. Give them whatever they need to learn and keep moving forward.\`;

// Toggle Window
window.toggleHelpWindow = () => {
    const win = document.getElementById("mockmentor-help-window");
    win.classList.toggle("active");
    if (win.classList.contains("active")) {
        document.getElementById("mm-chat-input").focus();
    }
};

// Add Message to DOM
window.addMmMessage = (text, role) => {
    const body = document.getElementById("mm-chat-body");
    const msgDiv = document.createElement("div");
    msgDiv.className = \`mm-msg \${role === 'user' ? 'mm-msg-user' : 'mm-msg-ai'}\`;

    // Basic markdown parsing for code blocks inside AI messages
    if (role === 'ai') {
        let formattedText = text;
        // Bold
        formattedText = formattedText.replace(/\\\\*\\\\*(.*?)\\\\*\\\\*/g, '<strong>\$1</strong>');
        // Code blocks
        formattedText = formattedText.replace(/\\\`\\\`\\\`(?:[a-z]+)?\\\\n([\\\\s\\\\S]*?)\\\`\\\`\\\`/gi, '<div class="mm-msg-code">\$1</div>');
        // Inline code
        formattedText = formattedText.replace(/\\\`(.*?)\\\`/g, '<span style="background:rgba(255,255,255,0.1);padding:2px 4px;border-radius:4px;font-family:monospace;font-size:12px;">\$1</span>');
        // Newlines
        formattedText = formattedText.replace(/\\\\n/g, '<br/>');
        msgDiv.innerHTML = formattedText;
    } else {
        msgDiv.innerText = text;
    }

    body.appendChild(msgDiv);
    body.scrollTop = body.scrollHeight;
};

// Handle Enter Key
window.handleMmKeyPress = (e) => {
    if (e.key === 'Enter') sendMmMessage();
};

// Send Message Flow
window.sendMmMessage = async () => {
    const input = document.getElementById("mm-chat-input");
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    addMmMessage(text, "user");
    mmChatHistory.push({ role: "user", content: text });
    input.value = "";

    // Show typing indicator
    const body = document.getElementById("mm-chat-body");
    const typingDiv = document.createElement("div");
    typingDiv.className = "mm-msg mm-msg-ai mm-typing-wrapper";
    typingDiv.innerHTML = '<div class="mm-typing-indicator"><div class="mm-dot"></div><div class="mm-dot"></div><div class="mm-dot"></div></div>';
    body.appendChild(typingDiv);
    body.scrollTop = body.scrollHeight;

    // Call API
    try {
        const rawContext = document.body.innerText.substring(0, 500); // Grab a glimpse of the page so AI knows where they are

        // Attempt to grab whatever Groq Key the user already put into localStorage during the main interview
        const storedGroq = "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";

        const messages = [
            { role: "system", content: SYSTEM_PROMPT + "\\\\n\\\\nThe user is currently on a page that looks like this context: " + rawContext },
            ...mmChatHistory.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))
        ];

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": \`Bearer \${storedGroq}\`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: messages,
                temperature: 0.5,
            })
        });

        const data = await res.json();
        typingDiv.remove();

        if (data.error) {
            addMmMessage("I'm having trouble connecting to the Help Desk server right now.", "ai");
            return;
        }

        const aiText = data.choices[0].message.content;
        mmChatHistory.push({ role: "ai", content: aiText });
        addMmMessage(aiText, "ai");

    } catch (err) {
        console.error(err);
        typingDiv.remove();
        addMmMessage("Network error. Could not reach the Help Desk.", "ai");
    }
};
</script>
    <script>// ============================================
// anti_cheat.js - Unified Interview Integrity Suite
// ============================================

// 1. Inject Violation Notification UI Container (if it doesn't exist)
if (!document.getElementById("violationWarnings")) {
    const container = document.createElement("div");
    container.id = "violationWarnings";
    // Fixed top-right, z-index max
    container.style.position = "fixed";
    container.style.top = "1rem";
    container.style.right = "1rem";
    container.style.zIndex = "999999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "0.5rem";
    document.body.appendChild(container);

    // Inject Tailwind custom animation style if not present
    const style = document.createElement("style");
    style.innerHTML = \`
        @keyframes ac-fade-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .ac-animate-fade-in { animation: ac-fade-in 0.3s ease-out forwards; }
        
        /* Aggressive User-Select Blocking */
        body {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
        }

        /* Allow typing in inputs/textareas and Monaco editor */
        input, textarea, .monaco-editor, .mm-chat-input {
            -webkit-user-select: auto !important;
            -moz-user-select: auto !important;
            -ms-user-select: auto !important;
            user-select: auto !important;
        }
    \`;
    document.head.appendChild(style);
}

// 2. State Management
let violationCount = 0;
const maxViolations = 4; // Allow a few warnings before total failure

// Function to log and display violations
window.registerViolation = function (reason) {
    violationCount++;

    const box = document.createElement("div");
    // Styling a red alert box
    box.className = "ac-animate-fade-in";
    box.style.backgroundColor = "rgba(239, 68, 68, 0.95)"; // Tailwind red-500
    box.style.color = "white";
    box.style.fontSize = "0.875rem"; // text-sm
    box.style.fontWeight = "bold";
    box.style.padding = "0.75rem 1rem";
    box.style.borderRadius = "0.5rem"; // rounded-lg
    box.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.5)"; // shadow-lg
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.gap = "0.5rem";
    box.style.fontFamily = "system-ui, -apple-system, sans-serif";

    box.innerHTML = \`
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        Violation: \${reason} (\${violationCount}/\${maxViolations})
    \`;

    document.getElementById("violationWarnings").appendChild(box);

    // Remove notification after 4 seconds
    setTimeout(() => {
        box.style.opacity = "0";
        box.style.transform = "translateX(20px)";
        box.style.transition = "all 0.3s ease-out";
        setTimeout(() => box.remove(), 300);
    }, 4000);

    // Log to session history if applicable (for report.html integration later)
    let sessionIntegrityLog = JSON.parse(sessionStorage.getItem("integrityLog") || "[]");
    sessionIntegrityLog.push({ timestamp: new Date().toISOString(), reason: reason });
    sessionStorage.setItem("integrityLog", JSON.stringify(sessionIntegrityLog));

    if (violationCount >= maxViolations) {
        alert("🚨 INTEGRITY FAILURE: Too many violations recorded. Your session has been flagged and will be terminated.");
        // Redirect to dashboard on total failure
        window.location.href = "dashboard.html";
    }
};

// 3. Event Listeners for DOM Protection
document.addEventListener("DOMContentLoaded", () => {

    // A. Tab Switching / Minimization
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            registerViolation("Tab Switched or Window Minimized");
        }
    });

    // B. Window Focus Lost (clicking on another app)
    window.addEventListener("blur", () => {
        registerViolation("Window Focus Lost");
    });

    // C. Right Click (Context Menu)
    document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        registerViolation("Right Click Disabled");
    });

    // D. Copying Text
    document.addEventListener("copy", (e) => {
        // Allow copying ONLY if inside the Monaco Editor
        if (e.target.closest('.monaco-editor')) return;
        e.preventDefault();
        registerViolation("Copying Text Blocked");
    });

    // E. Pasting Text
    document.addEventListener("paste", (e) => {
        // Allow pasting ONLY if inside the monaco editor or helpdesk input
        if (e.target.closest('.monaco-editor') || e.target.closest('.mm-chat-input')) return;
        e.preventDefault();
        registerViolation("Pasting Text Blocked");
    });

    // F. Developer Shortcuts Block
    document.addEventListener("keydown", (e) => {
        // F12 (DevTools)
        if (e.key === "F12") {
            e.preventDefault();
            registerViolation("Developer Tools Attempt (F12)");
        }
        // Ctrl+Shift+I (DevTools Inspect)
        if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) {
            e.preventDefault();
            registerViolation("Inspect Element Attempt");
        }
        // Ctrl+Shift+J (DevTools Console)
        if (e.ctrlKey && e.shiftKey && (e.key === "J" || e.key === "j")) {
            e.preventDefault();
            registerViolation("Console Attempt");
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
            e.preventDefault();
            registerViolation("View Page Source Attempt");
        }
        // Ctrl+C (Copy outside input)
        if (e.ctrlKey && (e.key === "C" || e.key === "c")) {
            // Let the explicit 'copy' event handle this so inputs work cleanly
        }
    });
});
</script>
</body>

</html>`;

export default function CognitiveTestScreen({ navigation }) {
    const injectedJs = `
      document.addEventListener('click', function(e) {
        let target = e.target;
        while(target && target.tagName !== 'A') {
          target = target.parentNode;
        }
        if (target && target.getAttribute('href')) {
          const href = target.getAttribute('href');
          if (href.startsWith('#') || href.startsWith('http')) return; // allow normal anchor/external links
          e.preventDefault();
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NAVIGATE', url: href }));
        }
      });
      true;
    `;

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'NAVIGATE') {
                const targetFile = data.url.split('?')[0].split('#')[0]; // strip query args
                // Route mapping happens in App.js usually, but we can do it here:
                navigation.navigate(targetFile);
            }
        } catch(e) {}
    };

    return (
        <SafeAreaView style={styles.container}>
            <WebView 
                source={{ html: htmlContent }} 
                injectedJavaScript={injectedJs}
                onMessage={handleMessage}
                originWhitelist={['*']}
                allowFileAccess={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                style={{ flex: 1 }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' }
});
