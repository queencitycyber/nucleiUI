import { state } from './state.js';
import { applyFilters } from './filters.js';
import { handleFileUpload } from './fileUpload.js';

/**
 * Initialize all event listeners for the application
 */
export function initEventListeners() {
    // Get DOM elements
    const fileUpload = document.getElementById('file-upload');
    const searchInput = document.getElementById('search');
    const severityFilter = document.getElementById('severity-filter');
    const tagFilter = document.getElementById('tag-filter');
    const resultsList = document.getElementById('results-list');
    const detailView = document.getElementById('detail-view');
    
    // File upload events - already handled in fileUpload.js
    
    // Search and filter events
    searchInput.addEventListener('input', applyFilters);
    severityFilter.addEventListener('change', applyFilters);
    tagFilter.addEventListener('input', applyFilters);
    
    // Handle window resize for responsive design
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            resultsList.style.display = 'block';
            detailView.style.display = 'block';
        }
    });
    
    // Add beforeunload event listener to warn before page reload/close
    window.addEventListener('beforeunload', function(e) {
        if (state.dataLoaded) {
            const message = 'Warning: Reloading will cause all scan data to be lost. Are you sure you want to continue?';
            e.returnValue = message;
            return message;
        }
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + F for search
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        document.getElementById('search').focus();
    }
    
    // Escape key to clear search
    if (event.key === 'Escape') {
        const searchInput = document.getElementById('search');
        if (document.activeElement === searchInput) {
            searchInput.value = '';
            applyFilters();
        }
    }
    
    // Arrow keys for navigating results when a result is selected
    if (state.selectedResultIndex >= 0 && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        event.preventDefault();
        
        const newIndex = event.key === 'ArrowUp' 
            ? Math.max(0, state.selectedResultIndex - 1)
            : Math.min(state.filteredResults.length - 1, state.selectedResultIndex + 1);
        
        if (newIndex !== state.selectedResultIndex) {
            // Simulate clicking on the result item
            const resultItem = document.querySelector(`.result-item[data-index="${newIndex}"]`);
            if (resultItem) {
                resultItem.click();
            }
        }
    }
}
