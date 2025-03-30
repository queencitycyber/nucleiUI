import { state, updateScanResults } from './state.js';
import { updateStats } from './stats.js';
import { initCharts } from './charts.js';
import { applyFilters } from './filters.js';

/**
 * Initializes the file upload system including:
 * - Drag and drop area
 * - File input change listener
 * - Clickable file info for re-uploading
 */
export function initFileUpload() {
    const fileInput = document.getElementById('file-upload');
    const uploadArea = document.querySelector('.upload-area');
    const fileInfo = document.querySelector('.file-info');

    if (!fileInput) {
        console.error('❌ File input element #file-upload not found');
        return;
    }

    // Listen for file selection
    fileInput.addEventListener('change', handleFileUpload);

    // Enable drag-and-drop file upload
    if (uploadArea) {
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
                fileInput.files = e.dataTransfer.files;
                fileInput.dispatchEvent(new Event('change'));
            }
        });
    } else {
        console.warn('⚠️ Upload area (.upload-area) not found, drag-and-drop disabled');
    }

    // Allow clicking on file info section to upload a new file
    if (fileInfo) {
        fileInfo.addEventListener('click', () => {
            if (state.dataLoaded && !confirm('Loading a new file will replace your current results. Continue?')) {
                return;
            }
            const fileInput = document.getElementById('file-upload');
            if (fileInput) fileInput.click();
        });
    }
}

/**
 * Handles file parsing and UI state updates
 */
export function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const text = e.target.result.trim();
            const parsed = text.startsWith('[')
                ? JSON.parse(text)
                : [JSON.parse(text)];

            updateScanResults(parsed);
            updateStats();
            initCharts();
            applyFilters();

            document.getElementById('file-name').textContent = file.name;
            document.querySelector('.file-info').style.display = 'flex';

            hideWelcomeScreen();
            hideUploadContainer();
        } catch (err) {
            alert('❌ Failed to parse JSON: ' + err.message);
            console.error('Error parsing uploaded JSON file:', err);
        }
    };

    reader.readAsText(file);
}

/**
 * Hides welcome screen, shows results view
 */
function hideWelcomeScreen() {
    const welcome = document.getElementById('welcome-screen');
    const results = document.getElementById('results-view');
    const header = document.querySelector('.results-header');

    if (welcome && results) {
        welcome.style.display = 'none';
        results.style.display = 'block';
        if (header) header.style.display = 'flex';
    }
}

/**
 * Displays upload container
 */
export function showUploadContainer() {
    // We don't need to do anything here since we're using the welcome screen
    // Just trigger the file input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.click();
}

/**
 * Hides upload container
 */
export function hideUploadContainer() {
    // No need to hide a container that doesn't exist
    // This function can be empty or removed
}

/**
 * Clears file input so the same file can be re-selected
 */
export function resetFileUpload() {
    const input = document.getElementById('file-upload');
    if (input) input.value = '';
}
