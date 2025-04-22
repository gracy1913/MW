/**
 * MindWell - Main JavaScript functionality
 * Contains common functionality used across the application
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('MindWell application initialized');
    
    // Initialize tooltips if Bootstrap is loaded
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Handle alert dismissal
    const alertList = document.querySelectorAll('.alert-dismissible');
    alertList.forEach(function(alert) {
        const closeButton = alert.querySelector('.btn-close');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                alert.classList.add('fade');
                setTimeout(function() {
                    alert.remove();
                }, 150);
            });
        }
        
        // Auto-dismiss success alerts after 5 seconds
        if (alert.classList.contains('alert-success')) {
            setTimeout(function() {
                alert.classList.add('fade');
                setTimeout(function() {
                    alert.remove();
                }, 150);
            }, 5000);
        }
    });

    // Add active class to current navigation link based on URL path
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        // Skip the home link when on other pages
        if (link.getAttribute('href') === '/' && currentPath !== '/') {
            return;
        }
        
        // Check if the current path starts with the link's href
        if (currentPath.startsWith(link.getAttribute('href')) && link.getAttribute('href') !== '/') {
            link.classList.add('active');
        } else if (currentPath === '/' && link.getAttribute('href') === '/') {
            link.classList.add('active');
        }
    });
});

/**
 * Format a date to display in a user-friendly format
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format time in hours:minutes:seconds
 * @param {number} seconds - The number of seconds to format
 * @returns {string} Formatted time string (MM:SS or HH:MM:SS)
 */
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const mm = m < 10 ? '0' + m : m;
    const ss = s < 10 ? '0' + s : s;
    
    if (h > 0) {
        const hh = h < 10 ? '0' + h : h;
        return `${hh}:${mm}:${ss}`;
    }
    
    return `${mm}:${ss}`;
}

/**
 * Generate a random ID for elements
 * @returns {string} A random string ID
 */
function generateRandomId(prefix = 'id') {
    return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Validate input field to ensure it's not empty
 * @param {HTMLElement} field - The input field to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateRequired(field) {
    if (!field.value.trim()) {
        field.classList.add('is-invalid');
        
        // Find or create feedback message
        let feedback = field.nextElementSibling;
        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
            feedback = document.createElement('div');
            feedback.classList.add('invalid-feedback');
            field.parentNode.insertBefore(feedback, field.nextSibling);
        }
        
        feedback.textContent = 'This field is required';
        return false;
    } else {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        return true;
    }
}

/**
 * Simple API request function with error handling
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch API options
 * @returns {Promise} Promise resolving to the JSON response
 */
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}
