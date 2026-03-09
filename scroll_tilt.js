// Vanilla JS implementation of 3D Container Scroll Effect (Aceternity UI style)
document.addEventListener("DOMContentLoaded", () => {
    const containers = document.querySelectorAll(".tilt-container");
    if (!containers.length) return;

    function updateTilt() {
        const isMobile = window.innerWidth <= 768;
        const windowHeight = window.innerHeight;

        containers.forEach((container) => {
            const header = container.querySelector(".tilt-header");
            const card = container.querySelector(".tilt-card");
            if (!header || !card) return;

            const rect = container.getBoundingClientRect();

            // Calculate how far the element is from the bottom of the viewport
            // rect.top is the distance from top of viewport to top of element
            // When rect.top == windowHeight, it's just about to enter from bottom.
            const distFromBottom = windowHeight - rect.top;

            let progress = 0;
            if (distFromBottom > 0) {
                // As it scrolls up, progress goes from 0 to 1 over the height of the window + element height
                progress = Math.min(1, distFromBottom / (windowHeight + rect.height / 2));
            }

            // Smooth out the curve (ease out)
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            // React Code Targets:
            // rotateX: 20 -> 0
            // scale desktop: 1.05 -> 1
            // scale mobile: 0.7 -> 0.9 (or we can just stick closer to 1 to avoid tiny cards)
            // header translateY: 0 -> -100px

            const rotateX = 20 - (easeProgress * 20);
            const scaleDesktop = 1.05 - (easeProgress * 0.05);
            const scaleMobile = 0.85 + (easeProgress * 0.15); // Better mobile scale
            const scale = isMobile ? scaleMobile : scaleDesktop;
            const translateY = -(easeProgress * 100);

            header.style.transform = `translateY(${translateY}px)`;

            card.style.transform = `rotateX(${rotateX}deg) scale(${scale})`;
            card.style.transition = "transform 0.1s ease-out"; // smooth micro-stutters
            card.style.boxShadow = "0 0 rgba(0,0,0,0.3), 0 9px 20px rgba(0,0,0,0.29), 0 37px 37px rgba(0,0,0,0.26), 0 84px 50px rgba(0,0,0,0.15), 0 149px 60px rgba(0,0,0,0.04), 0 233px 65px rgba(0,0,0,0.02)";
        });
    }

    window.addEventListener("scroll", updateTilt, { passive: true });
    window.addEventListener("resize", updateTilt);

    // Initial call
    setTimeout(updateTilt, 100);
});
