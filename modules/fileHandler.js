import { state, updateScanResults } from './state.js';
import { initCharts } from './charts.js';
import { applyFilters } from './filters.js';

export function initFileHandler() {
    setupFileUpload();
    setupDragAndDrop();
    setupFileInfo();
}

function setupFileUpload() {
    const fileUpload = document.getElementById('file-upload');
    const browseBtn = document.querySelector('.browse-btn');
    
    if (fileUpload) {
        fileUpload.accept = '.json';
        fileUpload.addEventListener('change', handleFileUpload);
    }
    
    if (browseBtn) {
        browseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (fileUpload) {
                fileUpload.click();
            }
        });
    }
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
        
        if (e.dataTransfer.files.length) {
            const fileUpload = document.getElementById('file-upload');
            fileUpload.files = e.dataTransfer.files;
            const event = new Event('change');
            fileUpload.dispatchEvent(event);
        }
    });
}

function setupFileInfo() {
    const fileInfo = document.querySelector('.file-info');
    if (fileInfo) {
        fileInfo.addEventListener('click', () => {
            if (state.dataLoaded) {
                if (!confirm('Warning: Loading a new file will replace your current data. Are you sure you want to continue?')) {
                    return;
                }
            }
            const uploadContainer = document.getElementById('upload-container');
            if (uploadContainer) {
                uploadContainer.style.display = 'flex';
            }
        });
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // Parse the JSON data
            let data = e.target.result;
            let parsedData;
            
            // Handle both array and single object formats
            if (data.trim().startsWith('[')) {
                parsedData = JSON.parse(data);
            } else {
                // If it's a single object, wrap it in an array
                parsedData = [JSON.parse(data)];
            }
            
            // Update state
            updateScanResults(parsedData);
            
            // Update UI
            updateStats();
            initCharts();
            applyFilters();
            
            // Show the file name
            const fileNameElement = document.getElementById('file-name');
            if (fileNameElement) {
                fileNameElement.textContent = file.name;
                document.querySelector('.file-info').style.display = 'flex';
            }
            
            // Hide the upload container
            const uploadContainer = document.getElementById('upload-container');
            if (uploadContainer) {
                uploadContainer.style.display = 'none';
            }
        } catch (error) {
            alert('Error parsing JSON file: ' + error.message);
            console.error('Error parsing JSON:', error);
        }
    };
    reader.readAsText(file);
}

export function loadExampleData(exampleData) {
    updateScanResults(exampleData);
    
    // Update UI
    updateStats();
    initCharts();
    applyFilters();
    
    // Show the file name
    const fileNameElement = document.getElementById('file-name');
    if (fileNameElement) {
        fileNameElement.textContent = 'Example Data';
        document.querySelector('.file-info').style.display = 'flex';
    }
    
    // Hide the upload container
    const uploadContainer = document.getElementById('upload-container');
    if (uploadContainer) {
        uploadContainer.style.display = 'none';
    }
}

function updateStats() {
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
    
    document.getElementById('total-findings').textContent = stats.total;
    document.getElementById('critical-count').textContent = stats.critical;
    document.getElementById('high-count').textContent = stats.high;
    document.getElementById('medium-count').textContent = stats.medium;
    document.getElementById('low-count').textContent = stats.low;
    document.getElementById('info-count').textContent = stats.info;
}
