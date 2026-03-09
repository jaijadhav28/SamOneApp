/**
 * Vanilla JS Implementation of GlowingEffect (Aceternity UI)
 * Tracks mouse movement and updates CSS variables to animate a conic-gradient border mask.
 */

document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".glass-card");
    if (!cards.length) return;

    cards.forEach((card) => {
        // Ensure the card is positioned relatively so the absolute inner div works
        card.classList.add("glow-wrapper");
        // Ensure styles are applied inline if missing
        if (getComputedStyle(card).position === 'static') {
            card.style.position = "relative";
        }

        // Inject the DOM structure for the glow effect
        const glowContainer = document.createElement("div");
        glowContainer.className = "glow-effect theme-default";

        // Set static CSS variables matching React defaults
        glowContainer.style.setProperty("--spread", "20");
        glowContainer.style.setProperty("--start", "0");
        glowContainer.style.setProperty("--active", "0");

        const glowEl = document.createElement("div");
        glowEl.className = "glow-el";
        glowEl.style.width = "100%";
        glowEl.style.height = "100%";
        glowEl.style.pointerEvents = "none"; // Critical: prevent click blocking

        glowContainer.appendChild(glowEl);

        // Prepend so it sits behind the actual content
        card.insertBefore(glowContainer, card.firstChild);
    });

    let animationFrameId = null;

    function handlePointerMove(e) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        animationFrameId = requestAnimationFrame(() => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            cards.forEach((card) => {
                const glowContainer = card.querySelector(".glow-effect");
                if (!glowContainer) return;

                const rect = card.getBoundingClientRect();

                // Define active zone
                const proximity = 0;
                const inactiveZone = 0.7; // Radius ratio where it turns off in the dead center

                const left = rect.left;
                const top = rect.top;
                const width = rect.width;
                const height = rect.height;

                const center = [left + width * 0.5, top + height * 0.5];
                const distanceFromCenter = Math.hypot(mouseX - center[0], mouseY - center[1]);
                const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

                if (distanceFromCenter < inactiveRadius) {
                    glowContainer.style.setProperty("--active", "0");
                    return;
                }

                const isActive =
                    mouseX > left - proximity &&
                    mouseX < left + width + proximity &&
                    mouseY > top - proximity &&
                    mouseY < top + height + proximity;

                glowContainer.style.setProperty("--active", isActive ? "1" : "0");

                if (!isActive) return;

                // Calculate Angle pointing towards the mouse
                let targetAngle = (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) / Math.PI + 90;

                glowContainer.style.setProperty("--start", String(targetAngle));
            });
        });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
});

