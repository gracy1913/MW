/**
 * MindWell - Mood Chart Visualization
 * Handles the visualization and dynamic updating of mood tracking data
 */

let moodChart = null;

/**
 * Initialize the mood chart using Chart.js
 * @param {string} selector - CSS selector for the chart canvas
 * @param {Array} dates - Array of date labels
 * @param {Array} moodLevels - Array of mood level values
 */
function initializeMoodChart(selector, dates, moodLevels) {
    const canvas = document.querySelector(selector);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (dates.length === 0 || moodLevels.length === 0) {
        // Display a message if no data
        displayNoDataMessage(canvas);
        return;
    }
    
    // Destroy existing chart if it exists
    if (moodChart) {
        moodChart.destroy();
    }
    
    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Mood Level (1-10)',
                data: moodLevels,
                fill: true,
                backgroundColor: 'rgba(23, 162, 184, 0.2)', // Bootstrap info color with opacity
                borderColor: 'rgba(23, 162, 184, 1)',       // Bootstrap info color
                borderWidth: 2,
                pointBackgroundColor: 'rgba(23, 162, 184, 1)',
                pointBorderColor: '#fff',
                pointRadius: 5,
                tension: 0.2 // Smooth curve
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 1
                    },
                    title: {
                        display: true,
                        text: 'Mood Level'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' // Lighter grid lines
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' // Lighter grid lines
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            family: "'system-ui', 'sans-serif'",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 14
                    },
                    callbacks: {
                        label: function(context) {
                            return `Mood Level: ${context.parsed.y}/10`;
                        },
                        title: function(context) {
                            return formatDate(context[0].label);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Display a message when no mood data is available
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
function displayNoDataMessage(canvas) {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No mood data available. Start tracking your mood!', width / 2, height / 2);
}

/**
 * Update the mood chart with new data from the API
 * @param {string} selector - CSS selector for the chart canvas
 */
function updateMoodChart(selector) {
    fetch('/api/mood-data')
        .then(response => response.json())
        .then(data => {
            initializeMoodChart(selector, data.labels, data.data);
        })
        .catch(error => {
            console.error('Error fetching mood data:', error);
        });
}

/**
 * Calculate and display mood statistics
 * @param {Array} moodLevels - Array of mood level values
 */
function updateMoodStats(moodLevels) {
    if (!moodLevels || moodLevels.length === 0) return;
    
    // Calculate average mood
    const sum = moodLevels.reduce((acc, val) => acc + val, 0);
    const average = (sum / moodLevels.length).toFixed(1);
    
    // Update average mood element if it exists
    const avgElement = document.getElementById('average-mood');
    if (avgElement) {
        avgElement.textContent = average;
    }
    
    // Calculate trend (improved, declined, or stable)
    if (moodLevels.length > 1) {
        const recentMood = moodLevels[moodLevels.length - 1];
        const previousMood = moodLevels[moodLevels.length - 2];
        
        const trendElement = document.getElementById('mood-trend');
        if (trendElement) {
            if (recentMood > previousMood) {
                trendElement.innerHTML = '<i class="fas fa-arrow-up text-success me-2"></i>Improving';
            } else if (recentMood < previousMood) {
                trendElement.innerHTML = '<i class="fas fa-arrow-down text-danger me-2"></i>Declining';
            } else {
                trendElement.innerHTML = '<i class="fas fa-equals text-warning me-2"></i>Stable';
            }
        }
    }
}

/**
 * Initialize mood tracking page functionality
 */
function initMoodTracker() {
    const moodSlider = document.getElementById('mood_level');
    const moodValue = document.getElementById('mood_value');
    
    if (moodSlider && moodValue) {
        // Update the mood value display when the slider changes
        moodSlider.addEventListener('input', function() {
            moodValue.textContent = this.value;
            
            // Optionally update emoji based on mood level
            updateMoodEmoji(this.value);
        });
        
        // Initial update
        moodValue.textContent = moodSlider.value;
    }
}

/**
 * Update mood emoji based on the mood level
 * @param {number} level - Mood level between 1-10
 */
function updateMoodEmoji(level) {
    const emojiContainer = document.getElementById('mood-emoji');
    if (!emojiContainer) return;
    
    // Clear existing content
    emojiContainer.innerHTML = '';
    
    // Add appropriate emoji based on mood level
    let emoji = '';
    let description = '';
    
    if (level >= 9) {
        emoji = '<i class="fas fa-grin-stars fa-2x text-success"></i>';
        description = 'Excellent';
    } else if (level >= 7) {
        emoji = '<i class="fas fa-grin-beam fa-2x text-success"></i>';
        description = 'Very Good';
    } else if (level >= 5) {
        emoji = '<i class="fas fa-smile fa-2x text-info"></i>';
        description = 'Good';
    } else if (level >= 3) {
        emoji = '<i class="fas fa-meh fa-2x text-warning"></i>';
        description = 'Okay';
    } else {
        emoji = '<i class="fas fa-frown fa-2x text-danger"></i>';
        description = 'Not Good';
    }
    
    emojiContainer.innerHTML = emoji;
    
    // Update description if element exists
    const descriptionElement = document.getElementById('mood-description');
    if (descriptionElement) {
        descriptionElement.textContent = description;
    }
}

// Initialize functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mood tracker if on mood tracking page
    if (document.getElementById('mood_level')) {
        initMoodTracker();
    }
    
    // Initialize mood chart if on dashboard page
    const chartCanvas = document.getElementById('moodChart');
    if (chartCanvas) {
        // Check if chart data is available in the page
        const datesElement = document.getElementById('chart-dates');
        const levelsElement = document.getElementById('chart-levels');
        
        if (datesElement && levelsElement) {
            // Data is embedded in the page
            const dates = JSON.parse(datesElement.textContent);
            const levels = JSON.parse(levelsElement.textContent);
            initializeMoodChart('#moodChart', dates, levels);
            updateMoodStats(levels);
        } else {
            // Fetch data from API
            updateMoodChart('#moodChart');
        }
    }
});
