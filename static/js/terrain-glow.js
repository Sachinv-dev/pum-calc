/*
 * Terrain Atmospheric Glow - Scroll Detection
 * Shows white glow when container overlaps with terrain
 * Developed by Sachin V with Perplexity AI
 */

function checkTerrainOverlap() {
    const container = document.querySelector('.container');
    const terrain = document.querySelector('.terrain-strip');

    if (!container || !terrain) return;

    // Get bounding rectangles
    const containerRect = container.getBoundingClientRect();
    const terrainRect = terrain.getBoundingClientRect();

    // Check if container overlaps terrain (with 50px threshold)
    const isOverlapping = containerRect.bottom > terrainRect.top ;

    // Toggle glow class
    if (isOverlapping) {
        terrain.classList.add('show-glow');
    } else {
        terrain.classList.remove('show-glow');
    }
}

// Listen to scroll events
window.addEventListener('scroll', checkTerrainOverlap);

// Check on page load
window.addEventListener('load', checkTerrainOverlap);

// Check on window resize
window.addEventListener('resize', checkTerrainOverlap);

// Check when DOM content loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkTerrainOverlap);
} else {
    checkTerrainOverlap();
}

// Watch for dynamic content changes (result section appearing)
const observer = new MutationObserver(checkTerrainOverlap);
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style']
});
