import { state } from './state.js';

export function initCharts() {
    const severityCtx = document.getElementById('severity-chart')?.getContext('2d');
    const tagsCtx = document.getElementById('tags-chart')?.getContext('2d');
    
    if (!severityCtx || !tagsCtx) {
        console.error('Chart elements not found');
        return;
    }
    
    // Count severities and prepare chart data
    const severityCounts = countSeverities();
    const tagCounts = countTags();
    
    createSeverityChart(severityCtx, severityCounts);
    createTagsChart(tagsCtx, tagCounts);
}

export function updateCharts() {
    if (state.charts.severityChart && state.charts.tagsChart) {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const textColor = isDarkMode ? '#e0e0e0' : '#333333';
        const gridColor = isDarkMode ? '#333333' : '#e0e0e0';
        
        // Update severity chart
        state.charts.severityChart.options.plugins.legend.labels.color = textColor;
        state.charts.severityChart.update();
        
        // Update tags chart
        state.charts.tagsChart.options.scales.x.ticks.color = textColor;
        state.charts.tagsChart.options.scales.y.ticks.color = textColor;
        state.charts.tagsChart.options.scales.x.grid.color = gridColor;
        state.charts.tagsChart.update();
    }
}

function countSeverities() {
    const severityCounts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0
    };
    
    state.scanResults.forEach(result => {
        const severity = result.info?.severity?.toLowerCase() || 'info';
        if (severityCounts[severity] !== undefined) {
            severityCounts[severity]++;
        }
    });
    
    return severityCounts;
}

function countTags() {
    const tagCounts = {};
    state.scanResults.forEach(result => {
        (result.info?.tags || []).forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    
    // Sort tags by count and get top 10
    return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
}

function createSeverityChart(ctx, severityCounts) {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#e0e0e0' : '#333333';
    
    const severityData = {
        labels: ['Critical', 'High', 'Medium', 'Low', 'Info'],
        datasets: [{
            data: [
                severityCounts.critical,
                severityCounts.high,
                severityCounts.medium,
                severityCounts.low,
                severityCounts.info
            ],
            backgroundColor: [
                '#e74c3c',
                '#e67e22',
                '#f39c12',
                '#3498db',
                '#7f8c8d'
            ],
            borderWidth: 0
        }]
    };
    
    // Destroy existing chart if it exists
    if (state.charts.severityChart) {
        state.charts.severityChart.destroy();
    }
    
    state.charts.severityChart = new Chart(ctx, {
        type: 'doughnut',
        data: severityData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: textColor,
                        padding: 10,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

function createTagsChart(ctx, topTags) {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#e0e0e0' : '#333333';
    const gridColor = isDarkMode ? '#333333' : '#e0e0e0';
    
    const tagsData = {
        labels: topTags.map(tag => tag[0]),
        datasets: [{
            label: 'Occurrences',
            data: topTags.map(tag => tag[1]),
            backgroundColor: '#3498db',
            borderColor: '#2980b9',
            borderWidth: 1
        }]
    };
    
    // Destroy existing chart if it exists
    if (state.charts.tagsChart) {
        state.charts.tagsChart.destroy();
    }
    
    state.charts.tagsChart = new Chart(ctx, {
        type: 'bar',
        data: tagsData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                y: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}
