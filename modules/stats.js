import { state } from './state.js';

export function updateStats() {
    const totalFindings = document.getElementById('total-findings');
    const criticalCount = document.getElementById('critical-count');
    const highCount = document.getElementById('high-count');
    const mediumCount = document.getElementById('medium-count');
    const lowCount = document.getElementById('low-count');
    const infoCount = document.getElementById('info-count');
    
    const stats = {
        total: state.scanResults.length,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0
    };
    
    state.scanResults.forEach(result => {
        const severity = result.info?.severity?.toLowerCase() || 'unknown';
        if (stats[severity] !== undefined) {
            stats[severity]++;
        }
    });
    
    totalFindings.textContent = stats.total;
    criticalCount.textContent = stats.critical;
    highCount.textContent = stats.high;
    mediumCount.textContent = stats.medium;
    lowCount.textContent = stats.low;
    infoCount.textContent = stats.info;
}

export function updateFilterStats() {
    document.getElementById('filtered-count').textContent = state.filteredResults.length;
}
