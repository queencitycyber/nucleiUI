import { state, updateFilteredResults } from './state.js';
import { renderResults } from './resultsView.js';

export function initFilters() {
    const searchInput = document.getElementById('search');
    const severityFilter = document.getElementById('severity-filter');
    const tagFilter = document.getElementById('tag-filter');
    const globalSearchInput = document.getElementById('global-search');
    const searchRequestsCheckbox = document.getElementById('search-requests');
    const searchResponsesCheckbox = document.getElementById('search-responses');
    
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (severityFilter) severityFilter.addEventListener('change', applyFilters);
    if (tagFilter) tagFilter.addEventListener('input', applyFilters);
    if (globalSearchInput) globalSearchInput.addEventListener('input', applyFilters);
    if (searchRequestsCheckbox) searchRequestsCheckbox.addEventListener('change', applyFilters);
    if (searchResponsesCheckbox) searchResponsesCheckbox.addEventListener('change', applyFilters);
}

export function applyFilters() {
    const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
    const severityValue = document.getElementById('severity-filter')?.value || 'all';
    const tagValue = document.getElementById('tag-filter')?.value.toLowerCase() || '';
    const globalSearchTerm = document.getElementById('global-search')?.value.toLowerCase() || '';
    const searchRequests = document.getElementById('search-requests')?.checked ?? true;
    const searchResponses = document.getElementById('search-responses')?.checked ?? true;
    
    const filtered = state.scanResults.filter(result => {
        // Search in name, host, and template-id
        const nameMatch = result.info?.name?.toLowerCase().includes(searchTerm) || false;
        const hostMatch = result.host?.toLowerCase().includes(searchTerm) || false;
        const templateMatch = result['template-id']?.toLowerCase().includes(searchTerm) || false;
        const searchMatch = nameMatch || hostMatch || templateMatch;
        
        // Filter by severity
        const severityMatch = severityValue === 'all' || 
                             (result.info?.severity?.toLowerCase() === severityValue);
        
        // Filter by tag
        let tagMatch = true;
        if (tagValue) {
            tagMatch = result.info?.tags?.some(tag => 
                tag.toLowerCase().includes(tagValue)
            ) || false;
        }
        
        // Global search in request/response
        let globalMatch = true;
        if (globalSearchTerm) {
            globalMatch = false;
            
            if (searchRequests && result.request) {
                globalMatch = globalMatch || result.request.toLowerCase().includes(globalSearchTerm);
            }
            
            if (searchResponses && result.response) {
                globalMatch = globalMatch || result.response.toLowerCase().includes(globalSearchTerm);
            }
        }
        
        return searchMatch && severityMatch && tagMatch && globalMatch;
    });
    
    updateFilteredResults(filtered);
    renderResults();
    updateFilteredCount();
}

function updateFilteredCount() {
    const filteredCountElement = document.getElementById('filtered-count');
    if (filteredCountElement) {
        filteredCountElement.textContent = state.filteredResults.length;
    }
}
