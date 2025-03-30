// Centralized state management
export const state = {
    scanResults: [],
    filteredResults: [],
    selectedResultIndex: -1,
    dataLoaded: false,
    charts: {
        severityChart: null,
        tagsChart: null
    }
};

// State update functions
export function updateScanResults(results) {
    state.scanResults = results;
    state.dataLoaded = true;
}

export function updateFilteredResults(results) {
    state.filteredResults = results;
}

export function setSelectedResult(index) {
    state.selectedResultIndex = index;
}

// Reset state
export function resetState() {
    state.scanResults = [];
    state.filteredResults = [];
    state.selectedResultIndex = -1;
    state.dataLoaded = false;
    
    if (state.charts.severityChart) {
        state.charts.severityChart.destroy();
        state.charts.severityChart = null;
    }
    
    if (state.charts.tagsChart) {
        state.charts.tagsChart.destroy();
        state.charts.tagsChart = null;
    }
}
