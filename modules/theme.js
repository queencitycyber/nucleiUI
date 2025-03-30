import { state } from './state.js';
import { updateCharts } from './charts.js';

export function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Theme toggle functionality
    themeToggle.addEventListener('click', toggleTheme);
    
    // Check for saved theme preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.innerHTML = isDarkMode ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
    
    // Update charts if they exist
    if (state.charts.severityChart && state.charts.tagsChart) {
        updateCharts();
    }
}
