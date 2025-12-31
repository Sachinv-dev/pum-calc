/*
 * Random Twinkling Stars Generator
 * Stars fade in once, then twinkle continuously
 */

// Generate evenly distributed stars

(function () {


function generateStars() {
    const starContainer = document.createElement('div');
    starContainer.className = 'star-field';
    starContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -3;
        pointer-events: none;
    `;

    // Create grid for even distribution
    const rows = 6;
    const cols = 10;
    const totalStars = 60;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const star = document.createElement('div');
            star.className = 'star';

            // Calculate grid cell boundaries
            const cellHeight = 80 / rows;
            const cellWidth = 100 / cols;

            // Random position within each grid cell
            const top = (row * cellHeight) + (Math.random() * cellHeight * 0.8) + (cellHeight * 0.1);
            const left = (col * cellWidth) + (Math.random() * cellWidth * 0.8) + (cellWidth * 0.1);

            // Random delay for twinkling
            const delay = Math.random() * 4;

            star.style.cssText = `
                position: absolute;
                top: ${top}%;
                left: ${left}%;
                width: 1px;
                height: 1px;
                background: white;
                box-shadow: 0 0 1.5px rgba(255, 255, 255, 0.4);
                border-radius: 50%;
                opacity: 0;
                animation: fadeIn 1.2s ease-out forwards;
            `;

            // Store delay for later
            star.dataset.delay = delay;

            starContainer.appendChild(star);
        }
    }

    document.body.insertBefore(starContainer, document.body.firstChild);

    // After fade-in completes, add twinkling
    setTimeout(() => {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            const delay = star.dataset.delay;
            // Add twinkle animation WITHOUT removing fadeIn result
            star.style.animation += `, twinkle 4s ease-in-out ${delay}s infinite`;
        });
    }, 1200);
}

// Animations
const meteorStyle = document.createElement('style');
meteorStyle.textContent = `
    /* Initial fade-in (plays once) */
    @keyframes fadeIn {
        from { 
            opacity: 0;
        }
        to {
            opacity: 0.35
        }
    }
    
    /* Twinkling (loops forever) */
    @keyframes twinkle {
        0%, 100% { 
            opacity: 0.35;
        }
        50% { 
            opacity: 1;
        }
    }
`;
document.head.appendChild(meteorStyle);

// Generate stars when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', generateStars);
} else {
    generateStars();
}


})();
