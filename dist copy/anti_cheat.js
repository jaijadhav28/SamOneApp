// ============================================
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
    style.innerHTML = `
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
    `;
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

    box.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        Violation: ${reason} (${violationCount}/${maxViolations})
    `;

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

