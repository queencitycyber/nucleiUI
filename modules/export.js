import { state } from './state.js';
import { utils } from './utils.js';

export function initExport() {
    document.getElementById('export-btn').addEventListener('click', exportResults);
}

function exportResults() {
    const exportFormat = document.getElementById('export-format').value;
    const exportFiltered = document.getElementById('export-filtered').checked;
    
    const dataToExport = exportFiltered ? state.filteredResults : state.scanResults;
    
    if (dataToExport.length === 0) {
        alert('No data to export');
        return;
    }
    
    let content, filename, type;
    
    switch (exportFormat) {
        case 'json':
            content = JSON.stringify(dataToExport, null, 2);
            filename = 'nuclei-results.json';
            type = 'application/json';
            break;
        case 'csv':
            content = convertToCSV(dataToExport);
            filename = 'nuclei-results.csv';
            type = 'text/csv';
            break;
        case 'html':
            content = generateHTMLReport(dataToExport);
            filename = 'nuclei-results.html';
            type = 'text/html';
            break;
    }
    
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    // Define CSV headers based on the structure
    const headers = [
        'Template ID', 'Name', 'Severity', 'Host', 'Port', 
        'URL', 'Timestamp', 'Tags', 'Description'
    ];
    
    let csv = headers.join(',') + '\n';
    
    data.forEach(item => {
        const row = [
            `"${(item['template-id'] || '').replace(/"/g, '""')}"`,
            `"${(item.info?.name || '').replace(/"/g, '""')}"`,
            `"${(item.info?.severity || '').replace(/"/g, '""')}"`,
            `"${(item.host || '').replace(/"/g, '""')}"`,
            `"${(item.port || '').replace(/"/g, '""')}"`,
            `"${(item.url || '').replace(/"/g, '""')}"`,
            `"${(item.timestamp || '').replace(/"/g, '""')}"`,
            `"${((item.info?.tags || []).join(', ') || '').replace(/"/g, '""')}"`,
            `"${(item.info?.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        ];
        
        csv += row.join(',') + '\n';
    });
    
    return csv;
}

function generateHTMLReport(data) {
    let severityCounts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0
    };
    
    data.forEach(item => {
        const severity = item.info?.severity?.toLowerCase() || 'info';
        if (severityCounts[severity] !== undefined) {
            severityCounts[severity]++;
        }
    });
    
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuclei Scan Results Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
            h1, h2 { color: #2c3e50; }
            .summary { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
            .stat { padding: 15px; border-radius: 5px; min-width: 120px; text-align: center; }
            .critical { background-color: #ffdddd; color: #e74c3c; }
            .high { background-color: #ffeedd; color: #e67e22; }
            .medium { background-color: #ffffdd; color: #f39c12; }
            .low { background-color: #ddffff; color: #3498db; }
            .info { background-color: #dddddd; color: #7f8c8d; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            tr:hover { background-color: #f5f5f5; }
            .severity-badge { padding: 5px 10px; border-radius: 4px; font-size: 12px; color: white; display: inline-block; }
            .tags span { background-color: #edf2f7; padding: 3px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; }
        </style>
    </head>
    <body>
        <h1>Nuclei Scan Results Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        
        <h2>Summary</h2>
        <div class="summary">
            <div class="stat">
                <h3>Total</h3>
                <p>${data.length}</p>
            </div>
            <div class="stat critical">
                <h3>Critical</h3>
                <p>${severityCounts.critical}</p>
            </div>
            <div class="stat high">
                <h3>High</h3>
                <p>${severityCounts.high}</p>
            </div>
            <div class="stat medium">
                <h3>Medium</h3>
                <p>${severityCounts.medium}</p>
            </div>
            <div class="stat low">
                <h3>Low</h3>
                <p>${severityCounts.low}</p>
            </div>
            <div class="stat info">
                <h3>Info</h3>
                <p>${severityCounts.info}</p>
            </div>
        </div>
        
        <h2>Findings</h2>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Severity</th>
                    <th>Host</th>
                    <th>Tags</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(item => {
        const severity = item.info?.severity?.toLowerCase() || 'info';
        const tags = item.info?.tags || [];
        
        html += `
            <tr>
                <td>${utils.escapeHtml(item.info?.name || 'Unnamed Finding')}</td>
                <td><span class="severity-badge" style="background-color: ${getSeverityColor(severity)}">${severity.toUpperCase()}</span></td>
                <td>${utils.escapeHtml(item.host || 'N/A')}</td>
                <td class="tags">${tags.map(tag => `<span>${utils.escapeHtml(tag)}</span>`).join('')}</td>
                <td>${utils.formatDate(item.timestamp)}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    </body>
    </html>
    `;
    
    return html;
}

function getSeverityColor(severity) {
    const colors = {
        critical: '#e74c3c',
        high: '#e67e22',
        medium: '#f39c12',
        low: '#3498db',
        info: '#7f8c8d'
    };
    return colors[severity] || colors.info;
}
