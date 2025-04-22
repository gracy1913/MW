from flask import render_template, request, redirect, url_for, session, flash, jsonify
from app import app, get_mood_entries, add_mood_entry, get_assessment_results, add_assessment_result, get_resources, get_resource
import logging

logger = logging.getLogger(__name__)

@app.route('/')
def index():
    """Home page route"""
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    """Dashboard displaying mood trends and assessment results"""
    mood_entries = get_mood_entries()
    assessment_results = get_assessment_results()
    
    # Process mood data for the chart
    dates = []
    mood_levels = []
    
    for entry in mood_entries:
        dates.append(entry['timestamp'].strftime('%Y-%m-%d'))
        mood_levels.append(entry['mood_level'])
    
    return render_template(
        'dashboard.html',
        mood_entries=mood_entries,
        assessment_results=assessment_results,
        dates=dates,
        mood_levels=mood_levels
    )

@app.route('/mood-tracker', methods=['GET', 'POST'])
def mood_tracker():
    """Mood tracking functionality"""
    if request.method == 'POST':
        try:
            mood_level = int(request.form.get('mood_level'))
            notes = request.form.get('notes', '')
            activities = request.form.getlist('activities')
            
            # Validate mood level
            if not 1 <= mood_level <= 10:
                flash('Mood level must be between 1 and 10', 'danger')
                return redirect(url_for('mood_tracker'))
            
            # Save mood entry
            mood_data = {
                'mood_level': mood_level,
                'notes': notes,
                'activities': activities
            }
            
            add_mood_entry(mood_data)
            flash('Mood entry saved successfully!', 'success')
            return redirect(url_for('dashboard'))
        
        except Exception as e:
            logger.error(f"Error saving mood: {str(e)}")
            flash('Error saving mood entry', 'danger')
    
    # GET request - display the form
    mood_entries = get_mood_entries(limit=10)  # Show recent entries
    return render_template('mood_tracker.html', mood_entries=mood_entries)

@app.route('/assessment', methods=['GET', 'POST'])
def assessment():
    """Mental health assessment tools"""
    if request.method == 'POST':
        assessment_type = request.form.get('assessment_type')
        
        if assessment_type == 'anxiety':
            # Process anxiety assessment
            try:
                # Calculate score (sum of all answers)
                score = sum(int(request.form.get(f'q{i}', 0)) for i in range(1, 8))
                
                # Determine interpretation
                if score <= 4:
                    interpretation = "Minimal anxiety"
                elif score <= 9:
                    interpretation = "Mild anxiety"
                elif score <= 14:
                    interpretation = "Moderate anxiety"
                else:
                    interpretation = "Severe anxiety"
                
                # Save result
                result_data = {
                    'assessment_type': 'Anxiety Assessment (GAD-7)',
                    'score': score,
                    'interpretation': interpretation,
                    'max_score': 21
                }
                
                add_assessment_result(result_data)
                flash('Assessment completed', 'success')
                return redirect(url_for('dashboard'))
            
            except Exception as e:
                logger.error(f"Error processing assessment: {str(e)}")
                flash('Error processing assessment', 'danger')
        
        elif assessment_type == 'depression':
            # Process depression assessment (PHQ-9)
            try:
                # Calculate score (sum of all answers)
                score = sum(int(request.form.get(f'q{i}', 0)) for i in range(1, 10))
                
                # Determine interpretation
                if score <= 4:
                    interpretation = "Minimal depression"
                elif score <= 9:
                    interpretation = "Mild depression"
                elif score <= 14:
                    interpretation = "Moderate depression"
                elif score <= 19:
                    interpretation = "Moderately severe depression"
                else:
                    interpretation = "Severe depression"
                
                # Save result
                result_data = {
                    'assessment_type': 'Depression Assessment (PHQ-9)',
                    'score': score,
                    'interpretation': interpretation,
                    'max_score': 27
                }
                
                add_assessment_result(result_data)
                flash('Assessment completed', 'success')
                return redirect(url_for('dashboard'))
            
            except Exception as e:
                logger.error(f"Error processing assessment: {str(e)}")
                flash('Error processing assessment', 'danger')
        
        elif assessment_type == 'stress':
            # Process stress assessment (PSS-10)
            try:
                # Calculate score 
                # For PSS-10, items 4, 5, 7, and 8 are positively stated and scored in reverse
                score = 0
                for i in range(1, 11):
                    val = int(request.form.get(f'q{i}', 0))
                    # Reverse score for positive items
                    if i in [4, 5, 7, 8]:
                        score += (4 - val)  # Reverse score (0=4, 1=3, 2=2, 3=1, 4=0)
                    else:
                        score += val
                
                # Determine interpretation
                if score <= 13:
                    interpretation = "Low stress"
                elif score <= 26:
                    interpretation = "Moderate stress"
                else:
                    interpretation = "High stress"
                
                # Save result
                result_data = {
                    'assessment_type': 'Perceived Stress Scale (PSS-10)',
                    'score': score,
                    'interpretation': interpretation,
                    'max_score': 40
                }
                
                add_assessment_result(result_data)
                flash('Assessment completed', 'success')
                return redirect(url_for('dashboard'))
            
            except Exception as e:
                logger.error(f"Error processing assessment: {str(e)}")
                flash('Error processing assessment', 'danger')
    
    # GET request - display the assessment options
    return render_template('assessment.html')

@app.route('/resources')
def resources():
    """Mental health resources library"""
    category = request.args.get('category')
    resources_list = get_resources(category)
    return render_template('resources.html', resources=resources_list)

@app.route('/resources/<int:resource_id>')
def resource_detail(resource_id):
    """Detailed view of a specific resource"""
    resource = get_resource(resource_id)
    if not resource:
        flash('Resource not found', 'danger')
        return redirect(url_for('resources'))
    return render_template('resources.html', resource=resource, resources=get_resources())

@app.route('/relaxation')
def relaxation():
    """Relaxation and mindfulness exercises"""
    return render_template('relaxation.html')

@app.route('/api/mood-data')
def mood_data():
    """API endpoint for mood tracking data (for AJAX requests)"""
    mood_entries = get_mood_entries()
    
    # Process data for charts
    dates = []
    mood_levels = []
    
    for entry in mood_entries:
        dates.append(entry['timestamp'].strftime('%Y-%m-%d'))
        mood_levels.append(entry['mood_level'])
    
    return jsonify({
        'labels': dates,
        'data': mood_levels
    })
