// Helper utilities

export const utils = {
    // Escape HTML to prevent XSS
    escapeHtml(str) {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },
  
    // Format date string
    formatDate(dateStr) {
      if (!dateStr) return 'N/A';
      try {
        const date = new Date(dateStr);
        return date.toLocaleString();
      } catch (e) {
        return dateStr;
      }
    },
  
    // Get severity color
    getSeverityColor(severity) {
      const colors = {
        critical: '#e74c3c',
        high: '#e67e22',
        medium: '#f39c12',
        low: '#3498db',
        info: '#7f8c8d'
      };
      return colors[severity] || colors.info;
    },
  
    // Download a file
    downloadFile(content, fileName, contentType) {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
    
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
    
      document.body.appendChild(a);
      a.click();
    
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }
};
