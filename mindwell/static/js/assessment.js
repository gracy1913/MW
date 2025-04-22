/**
 * MindWell - Assessment Tools JavaScript
 * Handles the functionality of mental health assessment forms
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all assessment forms
    const assessmentForms = {
        anxiety: document.getElementById('anxietyAssessment'),
        depression: document.getElementById('depressionAssessment'),
        stress: document.getElementById('stressAssessment')
    };
    
    // Add form validation to any assessment forms that exist
    Object.values(assessmentForms).forEach(form => {
        if (form) {
            setupFormValidation(form);
        }
    });
    
    // Add event listeners to assessment collapse triggers
    const collapseButtons = document.querySelectorAll('[data-bs-toggle="collapse"]');
    collapseButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Scroll to the form after it's expanded
            const targetId = this.getAttribute('data-bs-target');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Add a slight delay to allow the collapse animation to start
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 350);
            }
        });
    });
});

/**
 * Set up form validation for the assessment forms
 * @param {HTMLFormElement} form - The form element to validate
 */
function setupFormValidation(form) {
    form.addEventListener('submit', function(event) {
        let isValid = true;
        
        // Find all required radio button groups
        const radioGroups = {};
        
        // Group radio buttons by name
        form.querySelectorAll('input[type="radio"][required]').forEach(radio => {
            const name = radio.getAttribute('name');
            if (!radioGroups[name]) {
                radioGroups[name] = [];
            }
            radioGroups[name].push(radio);
            
            // Remove required attribute to prevent browser validation
            // We'll handle validation ourselves
            radio.removeAttribute('required');
        });
        
        // Check each radio group to ensure one option is selected
        Object.entries(radioGroups).forEach(([name, radios]) => {
            const isChecked = radios.some(radio => radio.checked);
            
            if (!isChecked) {
                isValid = false;
                
                // Find the containing card for this question
                const questionCard = radios[0].closest('.card');
                if (questionCard) {
                    questionCard.classList.add('border-danger');
                    
                    // Add error message if not already present
                    let errorMsg = questionCard.querySelector('.invalid-feedback');
                    if (!errorMsg) {
                        errorMsg = document.createElement('div');
                        errorMsg.className = 'invalid-feedback d-block mt-2';
                        errorMsg.textContent = 'Please select an option for this question.';
                        questionCard.querySelector('.card-body').appendChild(errorMsg);
                    } else {
                        errorMsg.classList.add('d-block');
                    }
                    
                    // Focus the first radio button in the group
                    radios[0].focus();
                }
            } else {
                // Remove error styling if question is answered
                const questionCard = radios[0].closest('.card');
                if (questionCard) {
                    questionCard.classList.remove('border-danger');
                    const errorMsg = questionCard.querySelector('.invalid-feedback');
                    if (errorMsg) {
                        errorMsg.classList.remove('d-block');
                    }
                }
            }
        });
        
        // If form is invalid, prevent submission
        if (!isValid) {
            event.preventDefault();
            
            // Scroll to the first error
            const firstError = form.querySelector('.border-danger');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Add a global error message at the top of the form
            let alertMsg = form.querySelector('.alert-danger');
            if (!alertMsg) {
                alertMsg = document.createElement('div');
                alertMsg.className = 'alert alert-danger mb-4';
                alertMsg.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Please answer all questions in the assessment.';
                form.prepend(alertMsg);
            }
        }
    });
    
    // Add listeners to remove error styling when radio buttons are selected
    form.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const name = this.getAttribute('name');
            const questionCard = this.closest('.card');
            
            if (questionCard) {
                questionCard.classList.remove('border-danger');
                const errorMsg = questionCard.querySelector('.invalid-feedback');
                if (errorMsg) {
                    errorMsg.classList.remove('d-block');
                }
            }
            
            // Check if all questions are now answered
            const allAnswered = Array.from(form.querySelectorAll('.border-danger')).length === 0;
            if (allAnswered) {
                // Remove the global error message
                const alertMsg = form.querySelector('.alert-danger');
                if (alertMsg) {
                    alertMsg.remove();
                }
            }
        });
    });
}

/**
 * Calculate the assessment score based on form data
 * @param {string} assessmentType - The type of assessment (anxiety, depression, stress)
 * @param {FormData} formData - The form data from the assessment
 * @returns {Object} An object containing the score and interpretation
 */
function calculateAssessmentScore(assessmentType, formData) {
    let score = 0;
    let maxScore = 0;
    let interpretation = '';
    
    // Get all question values and calculate score
    switch (assessmentType) {
        case 'anxiety':
            // GAD-7 Assessment
            for (let i = 1; i <= 7; i++) {
                score += parseInt(formData.get(`q${i}`) || 0);
            }
            maxScore = 21;
            
            // Determine interpretation based on score ranges
            if (score <= 4) {
                interpretation = "Minimal anxiety";
            } else if (score <= 9) {
                interpretation = "Mild anxiety";
            } else if (score <= 14) {
                interpretation = "Moderate anxiety";
            } else {
                interpretation = "Severe anxiety";
            }
            break;
            
        case 'depression':
            // PHQ-9 Assessment
            for (let i = 1; i <= 9; i++) {
                score += parseInt(formData.get(`q${i}`) || 0);
            }
            maxScore = 27;
            
            // Determine interpretation
            if (score <= 4) {
                interpretation = "Minimal depression";
            } else if (score <= 9) {
                interpretation = "Mild depression";
            } else if (score <= 14) {
                interpretation = "Moderate depression";
            } else if (score <= 19) {
                interpretation = "Moderately severe depression";
            } else {
                interpretation = "Severe depression";
            }
            break;
            
        case 'stress':
            // PSS-10 Assessment
            for (let i = 1; i <= 10; i++) {
                const val = parseInt(formData.get(`q${i}`) || 0);
                
                // Reverse score for questions 4, 5, 7, and 8 (positively stated items)
                if ([4, 5, 7, 8].includes(i)) {
                    score += (4 - val); // Reverse score (0=4, 1=3, 2=2, 3=1, 4=0)
                } else {
                    score += val;
                }
            }
            maxScore = 40;
            
            // Determine interpretation
            if (score <= 13) {
                interpretation = "Low stress";
            } else if (score <= 26) {
                interpretation = "Moderate stress";
            } else {
                interpretation = "High stress";
            }
            break;
    }
    
    return {
        score,
        maxScore,
        interpretation
    };
}

/**
 * Display a confirmation message after an assessment is completed
 * @param {string} assessmentType - The type of assessment
 * @param {Object} result - The assessment result
 */
function displayAssessmentResult(assessmentType, result) {
    // Create a modal to display the result
    const modalId = 'assessmentResultModal';
    let modal = document.getElementById(modalId);
    
    // If modal doesn't exist, create it
    if (!modal) {
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content bg-dark">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${modalId}Label">Assessment Result</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-3">
                                <div class="display-4 mb-3" id="result-score"></div>
                                <div class="progress mb-3">
                                    <div class="progress-bar" id="result-progress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <h5 id="result-interpretation"></h5>
                            </div>
                            <p id="result-description"></p>
                            <div class="alert alert-info mt-3">
                                <i class="fas fa-info-circle me-2"></i>
                                Remember that this assessment is not a diagnosis. If you're concerned about your results, please consult with a mental health professional.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <a href="/dashboard" class="btn btn-info">View Dashboard</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Append the modal to the body
        const div = document.createElement('div');
        div.innerHTML = modalHTML;
        document.body.appendChild(div);
        
        modal = document.getElementById(modalId);
    }
    
    // Update the modal content
    const scoreElement = modal.querySelector('#result-score');
    const progressBar = modal.querySelector('#result-progress');
    const interpretationElement = modal.querySelector('#result-interpretation');
    const descriptionElement = modal.querySelector('#result-description');
    
    if (scoreElement) scoreElement.textContent = `${result.score}/${result.maxScore}`;
    
    if (progressBar) {
        const percentage = (result.score / result.maxScore) * 100;
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
        
        // Set color based on interpretation
        progressBar.className = 'progress-bar';
        if (result.interpretation.toLowerCase().includes('minimal') || 
            result.interpretation.toLowerCase().includes('low')) {
            progressBar.classList.add('bg-success');
        } else if (result.interpretation.toLowerCase().includes('mild') || 
                  result.interpretation.toLowerCase().includes('moderate')) {
            progressBar.classList.add('bg-warning');
        } else {
            progressBar.classList.add('bg-danger');
        }
    }
    
    if (interpretationElement) interpretationElement.textContent = result.interpretation;
    
    if (descriptionElement) {
        let description = '';
        switch (assessmentType) {
            case 'anxiety':
                description = 'The GAD-7 (Generalized Anxiety Disorder-7) is a screening tool for anxiety. Your score indicates your level of anxiety symptoms over the past two weeks.';
                break;
            case 'depression':
                description = 'The PHQ-9 (Patient Health Questionnaire-9) is used to screen for depression. Your score reflects the severity of depression symptoms you\'ve experienced over the past two weeks.';
                break;
            case 'stress':
                description = 'The PSS-10 (Perceived Stress Scale) measures how unpredictable, uncontrollable, and overloaded you find your life. Your score indicates your perceived stress level over the past month.';
                break;
        }
        descriptionElement.textContent = description;
    }
    
    // Show the modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}
