import { state, setSelectedResult } from './state.js';
import { utils } from './utils.js';

export function initResultsView() {
    // Initial setup for results view
    const resultsList = document.getElementById('results-list');
    const detailView = document.getElementById('detail-view');
    
    // Handle window resize for responsive design
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            resultsList.style.display = 'block';
            detailView.style.display = 'block';
        }
    });
}

export function renderResults() {
    const resultsList = document.getElementById('results-list');
    const detailView = document.getElementById('detail-view');
    
    resultsList.innerHTML = '';
    
    if (state.filteredResults.length === 0) {
        resultsList.innerHTML = '<div class="no-results">No results found</div>';
        detailView.innerHTML = '<div class="placeholder"><i class="fas fa-search-plus"></i><p>No results to display</p></div>';
        return;
    }
    
    state.filteredResults.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.dataset.index = index;
        
        const severity = result.info?.severity?.toLowerCase() || 'info';
        
        resultItem.innerHTML = `
            <div class="result-header">
                <div class="result-title">${utils.escapeHtml(result.info?.name || 'Unnamed Finding')}</div>
                <div class="result-severity severity-badge-${severity}">${severity.toUpperCase()}</div>
            </div>
            <div class="result-meta">
                <div class="result-host">${utils.escapeHtml(result.host || 'N/A')}</div>
                <div class="result-date">${utils.formatDate(result.timestamp)}</div>
            </div>
            <div class="result-tags">
                ${(result.info?.tags || []).slice(0, 3).map(tag => 
                    `<span class="tag">${utils.escapeHtml(tag)}</span>`
                ).join('')}
                ${(result.info?.tags || []).length > 3 ? `<span class="tag">+${result.info.tags.length - 3} more</span>` : ''}
            </div>
        `;
        
        resultItem.addEventListener('click', () => {
            document.querySelectorAll('.result-item').forEach(item => {
                item.classList.remove('active');
            });
            resultItem.classList.add('active');
            setSelectedResult(index);
            renderDetailView(state.filteredResults[index]);
            
            // For mobile: show detail view
            if (window.innerWidth <= 1024) {
                resultsList.style.display = 'none';
                detailView.classList.add('active');
                detailView.style.display = 'block';
            }
        });
        
        resultsList.appendChild(resultItem);
    });
    
    // Select the first result by default
    if (state.filteredResults.length > 0 && state.selectedResultIndex === -1) {
        setSelectedResult(0);
        document.querySelector('.result-item').classList.add('active');
        renderDetailView(state.filteredResults[0]);
    } else if (state.selectedResultIndex >= 0 && state.selectedResultIndex < state.filteredResults.length) {
        // Keep the selected item if it's still in the filtered results
        document.querySelector(`.result-item[data-index="${state.selectedResultIndex}"]`)?.classList.add('active');
        renderDetailView(state.filteredResults[state.selectedResultIndex]);
    } else {
        // Reset if the selected item is no longer in the filtered results
        setSelectedResult(-1);
        detailView.innerHTML = '<div class="placeholder"><i class="fas fa-search-plus"></i><p>Select a finding to view details</p></div>';
    }
}

export function renderDetailView(result) {
    const detailView = document.getElementById('detail-view');
    
    if (!result) {
        detailView.innerHTML = '<div class="placeholder"><i class="fas fa-search-plus"></i><p>Select a finding to view details</p></div>';
        return;
    }
    
    const severity = result.info?.severity?.toLowerCase() || 'info';
    
    let detailHtml = `
        <div class="detail-header">
            <h2 class="detail-title">${utils.escapeHtml(result.info?.name || 'Unnamed Finding')}</h2>
            <div class="detail-meta">
                <div class="detail-meta-item">
                    <i class="fas fa-globe"></i> ${utils.escapeHtml(result.host || 'N/A')}
                </div>
                <div class="detail-meta-item">
                    <i class="fas fa-exclamation-triangle"></i> 
                    <span class="severity-${severity}">${severity.toUpperCase()}</span>
                </div>
                <div class="detail-meta-item">
                    <i class="fas fa-calendar"></i> ${utils.formatDate(result.timestamp)}
                </div>
                <div class="detail-meta-item">
                    <i class="fas fa-fingerprint"></i> ${utils.escapeHtml(result['template-id'] || 'N/A')}
                </div>
            </div>
            
            <div class="detail-tags">
                ${(result.info?.tags || []).map(tag => 
                    `<span class="detail-tag">${utils.escapeHtml(tag)}</span>`
                ).join('')}
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Description</h3>
            <div class="detail-description">${utils.escapeHtml(result.info?.description || 'No description available.')}</div>
        </div>
    `;
    
    if (result.info?.reference && result.info.reference.length > 0) {
        detailHtml += `
            <div class="detail-section">
                <h3>References</h3>
                <ul class="detail-references">
                    ${Array.isArray(result.info.reference) ? 
                        result.info.reference.map(ref => 
                            `<li><a href="${utils.escapeHtml(ref)}" target="_blank">${utils.escapeHtml(ref)}</a></li>`
                        ).join('') : 
                        `<li><a href="${utils.escapeHtml(result.info.reference)}" target="_blank">${utils.escapeHtml(result.info.reference)}</a></li>`
                    }
                </ul>
            </div>
        `;
    }
    
    detailHtml += `
        <div class="detail-section">
            <h3>Request</h3>
            <div class="request-response">${utils.escapeHtml(result.request || 'No request data available.')}</div>
        </div>
        
        <div class="detail-section">
            <h3>Response</h3>
            <div class="request-response">${utils.escapeHtml(result.response || 'No response data available.')}</div>
        </div>
        
        <div class="detail-section">
            <h3>cURL Command</h3>
            <div class="request-response">${utils.escapeHtml(result['curl-command'] || 'No cURL command available.')}</div>
            <button class="copy-btn" data-content="${utils.escapeHtml(result['curl-command'] || '')}">
                <i class="fas fa-copy"></i> Copy
            </button>
        </div>
    `;
    
    // Add back button for mobile view
    if (window.innerWidth <= 1024) {
        detailHtml = `
            <div class="mobile-back-button">
                <button id="back-to-list"><i class="fas fa-arrow-left"></i> Back to List</button>
            </div>
        ` + detailHtml;
    }
    
    detailView.innerHTML = detailHtml;
    
    // Add event listener for back button on mobile
    if (window.innerWidth <= 1024) {
        document.getElementById('back-to-list').addEventListener('click', () => {
            detailView.style.display = 'none';
            detailView.classList.remove('active');
            document.getElementById('results-list').style.display = 'block';
        });
    }
    
    // Add event listener for copy button
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.dataset.content;
            navigator.clipboard.writeText(content).then(() => {
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            });
        });
    });
}
