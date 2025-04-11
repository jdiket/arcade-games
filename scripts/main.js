/**
 * JavaScript Arcade - Main JavaScript
 * Common functionality for the arcade website
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Arcade Games Platform Initialized');
    
    // Animation for game cards
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // Check for "Coming Soon" games and add a special handler
    const comingSoonButtons = document.querySelectorAll('.play-button');
    
    comingSoonButtons.forEach(button => {
        if (button.textContent === 'COMING SOON') {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                alert('This game is coming soon! Check back later.');
            });
        }
    });
});

// Utility functions for games
const gameUtils = {
    // Generate a random number between min and max (inclusive)
    randomBetween: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    
    // Check collision between two rectangular objects
    checkCollision: (obj1, obj2) => {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    },
    
    // Store game scores in localStorage
    saveScore: (gameName, score) => {
        const scores = JSON.parse(localStorage.getItem('arcadeScores') || '{}');
        
        if (!scores[gameName]) {
            scores[gameName] = [];
        }
        
        // Add new score with timestamp
        scores[gameName].push({
            score: score,
            date: new Date().toISOString()
        });
        
        // Keep only top 10 scores
        scores[gameName].sort((a, b) => b.score - a.score);
        scores[gameName] = scores[gameName].slice(0, 10);
        
        localStorage.setItem('arcadeScores', JSON.stringify(scores));
    },
    
    // Get stored scores for a game
    getScores: (gameName) => {
        const scores = JSON.parse(localStorage.getItem('arcadeScores') || '{}');
        return scores[gameName] || [];
    },
    
    // Format time in MM:SS format
    formatTime: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};

// Make the utility functions available globally
window.gameUtils = gameUtils;