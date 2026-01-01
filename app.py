"""
IGCSE Grade Calculator - Backend
Handles all calculation logic for grade and PUM calculation
Developed by Sachin V with Perplexity AI
"""

from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

# ========== CONFIGURATION ==========
# UPDATE THESE PATHS TO YOUR ACTUAL FILE LOCATIONS

# Get the directory where app.py is located
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Build paths relative to app.py location
BASE_PATH = os.path.join(BASE_DIR, 'static', 'data', 'thresholds')
SCWF_PATH = os.path.join(BASE_DIR, 'static', 'data', 'scwf')

# ========== DATA MAPPINGS ==========

# Maps exam series to SCWF JSON files
JSON_MAPPING = {
    'November 2019': 'nov19-nov20-syllabus-component-weighting-factors.json',
    'March 2020': 'nov19-nov20-syllabus-component-weighting-factors.json',
    'June 2020': 'nov19-nov20-syllabus-component-weighting-factors.json',
    'November 2020': 'nov19-nov20-syllabus-component-weighting-factors.json',
    'March 2021': 'mar21-nov21-syllabus-component-weighting-factors.json',
    'June 2021': 'mar21-nov21-syllabus-component-weighting-factors.json',
    'November 2021': 'nov21-jul22-syllabus-component-weighting-factors.json',
    'March 2022': 'nov21-jul22-syllabus-component-weighting-factors.json',
    'June 2022': 'nov21-jul22-syllabus-component-weighting-factors.json',
    'November 2022': 'nov22-jul23-syllabus-component-weighting-factors.json',
    'March 2023': 'mar23-nov23-syllabus-component-weighting-factors.json',
    'June 2023': 'nov22-jul23-syllabus-component-weighting-factors.json',
    'November 2023': 'nov23-jul24-syllabus-component-weighting-factors.json',
    'March 2024': 'nov23-jul24-syllabus-component-weighting-factors.json',
    'June 2024': 'nov23-jul24-syllabus-component-weighting-factors.json',
    'November 2024': 'nov24-jul25-syllabus-component-weighting-factors.json',
    'March 2025': 'nov24-jul25-syllabus-component-weighting-factors.json',
    'June 2025': 'nov24-jul25-syllabus-component-weighting-factors.json',
}

# Maps subject codes to threshold JSON files
THRESHOLD_FILES = {
    '0500': 'english_thresholds.json',
    '0610': 'biology_thresholds.json',
    '0620': 'chemistry_thresholds.json',
    '0625': 'physics_thresholds.json',
    '0580': 'math_thresholds.json',
    '0478': 'computer_thresholds.json'
}

# Special cases where one series uses another's data
SERIES_ALIASES = {
    'June 2020': 'November 2020'
}

# ========== CALCULATION FUNCTIONS ==========

def load_scwf_from_json(json_path, exam_series, subject_code, components_needed):
    """
    Load SCWF (Syllabus Component Weighting Factor) data from JSON file
    
    Args:
        json_path: Full path to the SCWF JSON file
        exam_series: Exam series (e.g., "November 2024")
        subject_code: Subject code (e.g., "0610")
        components_needed: List of component codes (e.g., ['21', '41', '61'])
    
    Returns:
        List of dictionaries containing SCWF data for each component
    """
    try:
        with open(json_path, 'r') as f:
            scwf_data = json.load(f)
    except FileNotFoundError:
        return []
    
    results = []
    if exam_series in scwf_data:
        if subject_code in scwf_data[exam_series]:
            for component in components_needed:
                if component in scwf_data[exam_series][subject_code]:
                    data = scwf_data[exam_series][subject_code][component]
                    results.append({
                        'Component': component,
                        'Max Raw Mark': data['max_raw'],
                        'Max Weighted Mark': data['max_weighted'],
                        'SCWF': data['scwf']
                    })
    return results


def calculate_weighted_marks_web(marks_data):
    """
    Calculate weighted marks by applying SCWF to raw marks
    
    Args:
        marks_data: List of dictionaries containing raw marks and SCWF data
    
    Returns:
        Tuple of (syllabus_total, max_weighted_total, details)
    """
    total_weighted = 0
    details = []
    
    for item in marks_data:
        weighted_mark = item['Raw Mark'] * item['SCWF']
        total_weighted += weighted_mark
        details.append({
            'Component': item['Component'],
            'Raw Mark': item['Raw Mark'],
            'Max Raw': item['Max Raw Mark'],
            'SCWF': item['SCWF'],
            'Weighted Mark': round(weighted_mark, 2),
            'Max Weighted': item['Max Weighted Mark']
        })
    
    max_weighted_total = sum(item['Max Weighted Mark'] for item in marks_data)
    syllabus_total = round(total_weighted)
    
    return syllabus_total, max_weighted_total, details


def load_grade_thresholds(threshold_path, exam_series):
    """
    Load grade thresholds from JSON file
    
    Args:
        threshold_path: Full path to the threshold JSON file
        exam_series: Exam series (e.g., "November 2024")
    
    Returns:
        Dictionary containing threshold data for the exam series
    """
    try:
        with open(threshold_path, 'r') as f:
            threshold_data = json.load(f)
    except FileNotFoundError:
        return None
    
    if exam_series not in threshold_data:
        return None
    
    return threshold_data[exam_series]


def calculate_grade(syllabus_total, thresholds):
    """
    Determine grade based on syllabus total and thresholds
    Returns highest available grade student qualifies for
    """
    grades = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G']
    
    for grade in grades:
        if grade in thresholds:
            if syllabus_total >= thresholds[grade]:
                return grade
    
    return "U"


def calculate_pum(syllabus_total, grade, thresholds, max_weighted_total):
    """
    Calculate Percentage Uniform Mark (PUM)
    
    Core tier: Direct percentage (score/max * 100)
    Extended tier: Interpolated between grade boundaries
    """
    # Detect if Core or Extended tier
    is_core = not any(g in thresholds for g in ['A*', 'A', 'B'])
    
    # Handle ungraded
    if grade == 'U':
        return None
    
    # CORE TIER: Simple percentage
    if is_core:
        pum = (syllabus_total / max_weighted_total) * 100
        return round(pum)
    
    # EXTENDED TIER: Interpolated PUM
    pum_multipliers = {
        'A*': (11, 90),
        'A': (10, 80),
        'B': (10, 70),
        'C': (10, 60),
        'D': (10, 50),
        'E': (10, 40),
        'F': (10, 30),
        'G': (10, 20)
    }
    
    if grade not in thresholds:
        return None
    
    # Get lower bound
    lower_limit = thresholds[grade]
    
    # Find next available higher grade threshold
    grade_order = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'A*']
    current_index = grade_order.index(grade)
    
    upper_limit = None
    for i in range(current_index + 1, len(grade_order)):
        next_grade = grade_order[i]
        if next_grade in thresholds:
            upper_limit = thresholds[next_grade]
            break
    
    # If no higher threshold, use max total
    if upper_limit is None:
        upper_limit = max_weighted_total
    
    # Calculate interpolated PUM
    if grade in pum_multipliers:
        multiplier, base = pum_multipliers[grade]
        pum = ((syllabus_total - lower_limit) / (upper_limit - lower_limit)) * multiplier + base
        return min(round(pum), 100)
    
    return None



def auto_detect_option(components, threshold_data):
    """
    Automatically detect the option (R1, R2, etc.) based on components
    
    Args:
        components: List of component codes taken by student
        threshold_data: Dictionary containing threshold data
    
    Returns:
        Tuple of (option_code, components_string) or (None, None)
    """
    user_comp_set = set(components)
    
    for key in threshold_data.keys():
        if key.endswith('_components'):
            option_code = key.replace('_components', '')
            components_str = threshold_data[key]
            comp_parts = set([c.strip() for c in components_str.split(',')])
            
            if user_comp_set == comp_parts:
                return option_code, components_str
    
    return None, None

def validate_marks(raw_marks, scwf_data):
    """
    Validate that all raw marks are within acceptable ranges
    
    Args:
        raw_marks: List of raw marks entered by student
        scwf_data: List of SCWF data containing max raw marks
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    errors = []
    
    for i, (mark, scwf_info) in enumerate(zip(raw_marks, scwf_data)):
        component = scwf_info['Component']
        max_raw = scwf_info['Max Raw Mark']
        
        # Check if mark is a valid number
        try:
            mark_value = float(mark)
        except (ValueError, TypeError):
            errors.append(f"Component {component}: Invalid mark value")
            continue
        
        # Check if mark is negative
        if mark_value < 0:
            errors.append(f"Component {component}: Mark cannot be negative")
        
        # Check if mark exceeds maximum
        elif mark_value > max_raw:
            errors.append(f"Component {component}: Mark {mark_value} exceeds maximum of {max_raw}")
    
    if errors:
        return False, " | ".join(errors)
    
    return True, None

# ========== FLASK ROUTES ==========

@app.route('/')
def home():
    """Homepage - will show the calculator form in Phase 2"""
    return render_template('index.html')


@app.route('/calculate', methods=['POST'])
def calculate():
    """
    Main calculation endpoint
    Receives student data and returns grade, PUM, and breakdown
    
    Expected JSON input:
    {
        "subject_code": "0610",
        "exam_series": "November 2024",
        "components": ["21", "41", "61"],
        "raw_marks": [36, 54, 32]
    }
    
    Returns JSON with calculation results
    """
    try:
        # Get data from request
        data = request.get_json()
        
        subject_code = data['subject_code']
        exam_series = data['exam_series']
        components = data['components']
        raw_marks = data['raw_marks']
        
        # Handle series aliases (e.g., June 2020 → November 2020)
        actual_series = SERIES_ALIASES.get(exam_series, exam_series)
        
        # Get SCWF JSON file path
        json_filename = JSON_MAPPING.get(exam_series)
        if not json_filename:
            return jsonify({
                'success': False,
                'error': f'No SCWF data available for {exam_series}'
            })
        
        json_path = os.path.join(SCWF_PATH, json_filename)
        
        # Load SCWF data
        scwf_data = load_scwf_from_json(json_path, actual_series, subject_code, components)
        
        if not scwf_data:
            return jsonify({
                'success': False,
                'error': f'Could not load SCWF data for {subject_code} in {actual_series}'
            })
        
         # ========== ADD VALIDATION HERE ==========
        is_valid, error_message = validate_marks(raw_marks, scwf_data)
        
        if not is_valid:
            return jsonify({
                'success': False,
                'error': error_message
            })
        # =========================================
        
        # Combine raw marks with SCWF data
        marks_data = []
        for i, scwf_info in enumerate(scwf_data):
            marks_data.append({
                **scwf_info,
                'Raw Mark': raw_marks[i]
            })
        
        # Calculate weighted marks
        syllabus_total, max_total, details = calculate_weighted_marks_web(marks_data)
        
        # Load grade thresholds
        threshold_file = THRESHOLD_FILES.get(subject_code)
        if not threshold_file:
            return jsonify({
                'success': True,
                'syllabus_total': syllabus_total,
                'max_total': max_total,
                'details': details,
                'message': 'Thresholds not available for this subject'
            })
        
        threshold_path = os.path.join(BASE_PATH, threshold_file)
        threshold_data = load_grade_thresholds(threshold_path, actual_series)
        
        if not threshold_data:
            return jsonify({
                'success': True,
                'syllabus_total': syllabus_total,
                'max_total': max_total,
                'details': details,
                'message': 'Thresholds not available for this exam series'
            })
        
        # Auto-detect option based on components
        option_code, components_str = auto_detect_option(components, threshold_data)
        
        if not option_code:
            return jsonify({
                'success': True,
                'syllabus_total': syllabus_total,
                'max_total': max_total,
                'details': details,
                'message': 'Could not auto-detect option from components'
            })
        
        # Extract thresholds for the detected option
        option_thresholds = {}
        grades = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G']
        for grade in grades:
            key = f"{option_code}_{grade}"
            if key in threshold_data:
                option_thresholds[grade] = threshold_data[key]
        
        # Calculate final grade
        final_grade = calculate_grade(syllabus_total, option_thresholds)
        
        # Calculate PUM
        pum = calculate_pum(syllabus_total, final_grade, option_thresholds, max_total)
        
        # Return complete results
        return jsonify({
            'success': True,
            'grade': final_grade,
            'pum': pum,
            'syllabus_total': syllabus_total,
            'max_total': max_total,
            'option': option_code,
            'thresholds': option_thresholds,
            'details': details
        })
        
    except Exception as e:
        # Return error information for debugging
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/calculate_custom', methods=['POST'])
def calculate_custom():
    """
    Custom calculation endpoint for manual input
    Allows users to input their own SCWF and threshold data
    """
    try:
        data = request.get_json()
        
        components = data['components']
        raw_marks = data['raw_marks']
        custom_scwf = data['custom_scwf']
        custom_thresholds = data['custom_thresholds']
        
        # Validate marks
        is_valid, error_message = validate_marks(raw_marks, custom_scwf)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': error_message
            })
        
        # Combine raw marks with SCWF data
        marks_data = []
        for i, scwf_info in enumerate(custom_scwf):
            marks_data.append({
                **scwf_info,
                'Raw Mark': raw_marks[i]
            })
        
        # Calculate weighted marks
        syllabus_total, max_total, details = calculate_weighted_marks_web(marks_data)
        
        # Calculate grade
        final_grade = calculate_grade(syllabus_total, custom_thresholds)
        
        # Calculate PUM
        pum = calculate_pum(syllabus_total, final_grade, custom_thresholds, max_total)
        
        # Return results
        return jsonify({
            'success': True,
            'grade': final_grade,
            'pum': pum,
            'syllabus_total': syllabus_total,
            'max_total': max_total,
            'option': 'Custom',
            'thresholds': custom_thresholds,
            'details': details
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

# ========== START SERVER ==========

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000,debug=True)
