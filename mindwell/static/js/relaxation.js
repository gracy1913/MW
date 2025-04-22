/**
 * MindWell - Relaxation and Mindfulness Exercises JavaScript
 * Handles functionality for meditation timer and breathing exercises
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize breathing exercise
    initBreathingExercise();
    
    // Initialize meditation timer
    initMeditationTimer();
});

/**
 * Initialize the breathing animation exercise
 */
function initBreathingExercise() {
    const breathingCircle = document.getElementById('breathing-circle');
    const startButton = document.getElementById('start-breathing');
    const instructionText = document.querySelector('.instruction-text');
    
    if (!breathingCircle || !startButton) return;
    
    let isActive = false;
    let currentPhase = 'inhale';
    let breathingInterval;
    
    startButton.addEventListener('click', toggleBreathingExercise);
    breathingCircle.addEventListener('click', toggleBreathingExercise);
    
    function toggleBreathingExercise() {
        if (isActive) {
            stopBreathingExercise();
        } else {
            startBreathingExercise();
        }
    }
    
    function startBreathingExercise() {
        isActive = true;
        startButton.textContent = 'Stop Exercise';
        startButton.classList.remove('btn-info');
        startButton.classList.add('btn-outline-info');
        
        // Start the breathing cycle
        breathingCycle();
        
        // Set interval to continue the breathing cycle
        breathingInterval = setInterval(breathingCycle, 19000); // Total cycle is 19 seconds
    }
    
    function stopBreathingExercise() {
        isActive = false;
        clearInterval(breathingInterval);
        
        // Reset circle and text
        breathingCircle.classList.remove('circle-inhale', 'circle-hold', 'circle-exhale');
        instructionText.textContent = 'Click to begin';
        startButton.textContent = 'Start Exercise';
        startButton.classList.remove('btn-outline-info');
        startButton.classList.add('btn-info');
    }
    
    function breathingCycle() {
        // Inhale phase (4 seconds)
        breathingCircle.classList.remove('circle-exhale', 'circle-hold');
        breathingCircle.classList.add('circle-inhale');
        instructionText.textContent = 'Inhale through your nose (4s)';
        
        // Hold phase (7 seconds)
        setTimeout(() => {
            breathingCircle.classList.remove('circle-inhale');
            breathingCircle.classList.add('circle-hold');
            instructionText.textContent = 'Hold your breath (7s)';
        }, 4000);
        
        // Exhale phase (8 seconds)
        setTimeout(() => {
            breathingCircle.classList.remove('circle-hold');
            breathingCircle.classList.add('circle-exhale');
            instructionText.textContent = 'Exhale through your mouth (8s)';
        }, 11000);
    }
}

/**
 * Initialize the meditation timer
 */
function initMeditationTimer() {
    const startTimerBtn = document.getElementById('start-timer');
    const pauseTimerBtn = document.getElementById('pause-timer');
    const stopTimerBtn = document.getElementById('stop-timer');
    const timerDisplay = document.querySelector('.timer-display');
    const timerCountdown = document.getElementById('timer-countdown');
    const timerStatus = document.getElementById('timer-status');
    
    if (!startTimerBtn || !timerDisplay) return;
    
    let timerInterval;
    let remainingTime = 0;
    let isPaused = false;
    
    // Create audio elements for bells
    const startBell = new Audio();
    startBell.src = 'https://cdn.freesound.org/previews/411/411089_5121236-lq.mp3'; // Tibetan bowl sound
    
    const intervalBell = new Audio();
    intervalBell.src = 'https://cdn.freesound.org/previews/339/339816_5121236-lq.mp3'; // Soft bell
    
    const endBell = new Audio();
    endBell.src = 'https://cdn.freesound.org/previews/414/414605_5121236-lq.mp3'; // Three bells
    
    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    stopTimerBtn.addEventListener('click', stopTimer);
    
    function startTimer() {
        // Get timer settings
        const duration = document.getElementById('duration').value;
        const intervalBellSetting = document.getElementById('interval-bells').value;
        const playStartBell = document.getElementById('start-bell').checked;
        const playEndBell = document.getElementById('end-bell').checked;
        
        // Calculate total seconds
        const totalSeconds = duration * 60;
        
        if (!isPaused) {
            // Initialize timer if not resuming from pause
            remainingTime = totalSeconds;
        }
        
        // Show timer display and control buttons
        timerDisplay.classList.remove('d-none');
        startTimerBtn.classList.add('d-none');
        pauseTimerBtn.classList.remove('d-none');
        stopTimerBtn.classList.remove('d-none');
        
        // Update display initially
        updateTimerDisplay(remainingTime);
        
        // Play start bell if enabled
        if (playStartBell && !isPaused) {
            startBell.play();
        }
        
        // Set the timer status
        timerStatus.textContent = 'Meditation in progress...';
        
        // Clear any existing interval
        clearInterval(timerInterval);
        
        // Set the interval for countdown
        let intervalCounter = 0;
        isPaused = false;
        
        timerInterval = setInterval(() => {
            remainingTime--;
            intervalCounter++;
            
            // Play interval bell if enabled and we've reached the interval
            if (intervalBellSetting > 0 && intervalCounter % (intervalBellSetting * 60) === 0) {
                intervalBell.play();
            }
            
            updateTimerDisplay(remainingTime);
            
            // Check if timer is complete
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                timerStatus.textContent = 'Meditation complete!';
                
                // Play end bell if enabled
                if (playEndBell) {
                    endBell.play();
                }
                
                // Reset controls
                startTimerBtn.classList.remove('d-none');
                pauseTimerBtn.classList.add('d-none');
                stopTimerBtn.classList.add('d-none');
            }
        }, 1000);
    }
    
    function pauseTimer() {
        clearInterval(timerInterval);
        isPaused = true;
        
        pauseTimerBtn.classList.add('d-none');
        startTimerBtn.classList.remove('d-none');
        timerStatus.textContent = 'Meditation paused';
    }
    
    function stopTimer() {
        clearInterval(timerInterval);
        isPaused = false;
        
        // Hide timer display and reset buttons
        timerDisplay.classList.add('d-none');
        startTimerBtn.classList.remove('d-none');
        pauseTimerBtn.classList.add('d-none');
        stopTimerBtn.classList.add('d-none');
    }
    
    function updateTimerDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        // Format as MM:SS
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
        
        timerCountdown.textContent = `${formattedMinutes}:${formattedSeconds}`;
    }
}
