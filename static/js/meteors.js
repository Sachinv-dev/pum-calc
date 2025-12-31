/*
 * Random Shooting Star Generator
 * Creates realistic meteors at random intervals
 */

// Create a single random meteor
(function () {



function createRandomMeteor() {
    const meteor = document.createElement('div');
    meteor.className = 'shooting-star-random';

    // Random position (avoid extreme edges)
    // Random position - biased toward edges, avoid center
    const top = Math.random() * 60 + 10; // 10% to 70% from top

    // Bias left position toward edges (avoid center container area)
    let left;
    if (Math.random() < 0.8) {
        // 70% chance: appear on edges (left or right side)
        if (Math.random() < 0.5) {
            // Left side (5% to 25%)
            left = Math.random() * 20 + 5;
        } else {
            // Right side (75% to 95%)
            left = Math.random() * 20 + 75;
        }
    } else {
        // 30% chance: anywhere (including center)
        left = Math.random() * 85 + 5;
    }


    // Random size (length of meteor)
    const width = Math.random() * 25 + 45; // 45-70px long

    // Random angle (diagonal falling)
    const angle = Math.random() * 25 - 50; // -50° to -25°

    // Random speed
    const duration = Math.random() * 0.2 + 0.3; // 0.7-1.1 seconds

    // Random brightness
    const brightness = Math.random() * 0.3 + 0.7; // 0.7-1.0 opacity

    // Apply styles
    meteor.style.cssText = `
        position: fixed;
        top: ${top}%;
        left: ${left}%;
        width: ${width}px;
        height: 2px;
        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, ${brightness}) 50%, transparent 100%);
        border-radius: 50%;
        z-index: -2;
        filter: blur(1px);
        pointer-events: none;
        opacity: 0;
        transform: rotate(${angle}deg);
        animation: meteorStreak ${duration}s ease-out forwards;
    `;

    document.body.appendChild(meteor);

    // Remove meteor after animation completes
    setTimeout(() => {
        meteor.remove();
    }, duration * 1000 + 100);
}

// Add CSS animation dynamically
const meteorStyle = document.createElement('style');
meteorStyle.textContent = `
    @keyframes meteorStreak {
        0% { 
            opacity: 0;
            transform: translate(0, 0) rotate(var(--rotation, -40deg));
        }
        15% { 
            opacity: 1;
        }
        100% { 
            opacity: 0;
            transform: translate(-70px, 70px) rotate(var(--rotation, -40deg));
        }
    }
`;
document.head.appendChild(meteorStyle);

// Schedule next meteor at random interval
function scheduleMeteor() {
    createRandomMeteor();

    // Random delay before next meteor (1-3.5 seconds)
    const nextDelay = Math.random() * 3000 + 1500;
    setTimeout(scheduleMeteor, nextDelay);
}

// Start meteor shower after page loads and animations settle
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(scheduleMeteor, 4000); // Start after 2.5s
});

})();

