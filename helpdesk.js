// ============================================
// helpdesk.js - Universal Floating AI Tutor
// ============================================

// 1. Core Styles
const styles = `
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
`;

// 2. Inject CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// 3. Inject HTML
const helpDeskHTML = `
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
`;

const container = document.createElement('div');
container.innerHTML = helpDeskHTML;
document.body.appendChild(container);

// 4. Logic & State
let mmChatHistory = [];
const SYSTEM_PROMPT = `You are the MockMentor AI Help Desk Tutor. 
The user is currently taking a technical interview or assessment on the MockMentor platform. 
They have opened this Help Desk widget because they are stuck, confused, or want to learn a concept.
Your job is to be extremely supportive, friendly, and educational.
If they ask for a hint, give them a breadcrumb.
If they ask for the exact solution or code because they gave up, PROVIDE IT TO THEM clearly with well-commented code blocks! 
We DO NOT want them leaving the platform to Google it. Give them whatever they need to learn and keep moving forward.`;

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
    msgDiv.className = `mm-msg ${role === 'user' ? 'mm-msg-user' : 'mm-msg-ai'}`;

    // Basic markdown parsing for code blocks inside AI messages
    if (role === 'ai') {
        let formattedText = text;
        // Bold
        formattedText = formattedText.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
        // Code blocks
        formattedText = formattedText.replace(/\`\`\`(?:[a-z]+)?\\n([\\s\\S]*?)\`\`\`/gi, '<div class="mm-msg-code">$1</div>');
        // Inline code
        formattedText = formattedText.replace(/\`(.*?)\`/g, '<span style="background:rgba(255,255,255,0.1);padding:2px 4px;border-radius:4px;font-family:monospace;font-size:12px;">$1</span>');
        // Newlines
        formattedText = formattedText.replace(/\\n/g, '<br/>');
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
            { role: "system", content: SYSTEM_PROMPT + "\\n\\nThe user is currently on a page that looks like this context: " + rawContext },
            ...mmChatHistory.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))
        ];

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${storedGroq}`
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
