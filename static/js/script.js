/*
 * IGCSE Grade Calculator - JavaScript
 * Phase 3: Interactive Form Logic (Linear Structure)
 * Developed by Sachin V with Perplexity AI
 */

// ========== CONFIGURATION DATA ==========

const YEAR_SEASONS = {
    '2019': ['November 2019'],
    '2020': ['March 2020', 'June 2020', 'November 2020'],
    '2021': ['March 2021', 'June 2021', 'November 2021'],
    '2022': ['March 2022', 'June 2022', 'November 2022'],
    '2023': ['March 2023', 'June 2023', 'November 2023'],
    '2024': ['March 2024', 'June 2024', 'November 2024'],
    '2025': ['March 2025', 'June 2025']
};

const SUBJECT_PAPERS = {
    '0610': { 
        name: 'Biology', 
        hasTypes: true,
        extended: { mcq: '2', theory: '4', practical: ['5', '6'] },
        core: { mcq: '1', theory: '3', practical: ['5', '6'] }
    },
    '0620': { 
        name: 'Chemistry', 
        hasTypes: true,
        extended: { mcq: '2', theory: '4', practical: ['5', '6'] },
        core: { mcq: '1', theory: '3', practical: ['5', '6'] }
    },
    '0625': { 
        name: 'Physics', 
        hasTypes: true,
        extended: { mcq: '2', theory: '4', practical: ['5', '6'] },
        core: { mcq: '1', theory: '3', practical: ['5', '6'] }
    },
    '0580': { 
        name: 'Mathematics', 
        hasTypes: true,
        extended: ['2', '4'],
        core: ['1', '3']
    },
    '0500': { 
        name: 'English', 
        hasTypes: false,
        papers: ['1', '2']
    },
    '0478': { 
        name: 'Computer Science', 
        hasTypes: false,
        papers: ['1', '2']
    }
};


const VARIANTS = ['1', '2', '3'];

// ========== GLOBAL STATE ==========
let selectedComponents = [];

// ========== MASTER VALIDATION & UPDATE FUNCTION ==========

function validateAndUpdateForm() {
    const subject = document.getElementById('subject').value;
    const year = document.getElementById('year').value;
    const season = document.getElementById('season').value;
    const paperType = document.getElementById('paperType').value;

    console.log(`Validating: Subject=${subject}, Year=${year}, Season=${season}, Type=${paperType}`);

    const hasBasicInfo = subject && year && season;

    if (!hasBasicInfo) {
        hideFromStep(4);
        return;
    }

    const subjectData = SUBJECT_PAPERS[subject];

    if (subjectData.hasTypes) {
        document.getElementById('typeSelection').style.display = 'block';

        if (!paperType) {
            hideFromStep(5);
            return;
        }
    } else {
        document.getElementById('typeSelection').style.display = 'none';
    }

    generateComponentSelectors();
}

// ========== HIDE FUNCTIONS ==========

function hideFromStep(step) {
    if (step <= 4) {
        document.getElementById('typeSelection').style.display = 'none';
    }
    if (step <= 5) {
        document.getElementById('componentSelection').style.display = 'none';
    }
    if (step <= 6) {
        document.getElementById('markInputs').style.display = 'none';
    }
    if (step <= 7) {
        document.getElementById('result').style.display = 'none';
    }
}

// ========== POPULATE SEASONS ==========

function populateSeasons() {
    const yearSelect = document.getElementById('year');
    const seasonSelect = document.getElementById('season');
    const selectedYear = yearSelect.value;

    const currentSeason = seasonSelect.value;

    seasonSelect.innerHTML = '<option value="">-- Select season --</option>';

    if (selectedYear && YEAR_SEASONS[selectedYear]) {
        const seasons = YEAR_SEASONS[selectedYear];
        seasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season;
            option.textContent = season;
            seasonSelect.appendChild(option);
        });

        if (currentSeason && seasons.includes(currentSeason)) {
            seasonSelect.value = currentSeason;
        }
    }

    validateAndUpdateForm();
}

// ========== GENERATE COMPONENT SELECTORS ==========

function generateComponentSelectors() {
    const subjectSelect = document.getElementById('subject');
    const typeSelect = document.getElementById('paperType');
    const seasonSelect = document.getElementById('season');
    const componentSelectionDiv = document.getElementById('componentSelection');
    const componentOptionsDiv = document.getElementById('componentOptions');

    const selectedSubject = subjectSelect.value;
    const selectedType = typeSelect.value;
    const selectedSeason = seasonSelect.value;
    const subjectData = SUBJECT_PAPERS[selectedSubject];

    // Check if it's March series
    const isMarchSeries = selectedSeason && selectedSeason.includes('March');

    componentOptionsDiv.innerHTML = '';

    // Handle sciences with practical choice
    if (['0610', '0620', '0625'].includes(selectedSubject)) {
        const tierData = subjectData[selectedType];
        
        // MCQ Paper
        createVariantSelector(tierData.mcq, 'MCQ', componentOptionsDiv, isMarchSeries);
        
        // Theory Paper
        createVariantSelector(tierData.theory, 'Theory', componentOptionsDiv, isMarchSeries);
        
        // Practical Choice (5 or 6)
        createPracticalSelector(tierData.practical, componentOptionsDiv, isMarchSeries);
        
    } else {
        // Other subjects (Math, English, CompSci)
        let papers = [];
        if (subjectData.hasTypes) {
            papers = subjectData[selectedType];
        } else {
            papers = subjectData.papers;
        }

        papers.forEach(paper => {
            createVariantSelector(paper, `Paper ${paper}`, componentOptionsDiv, isMarchSeries);
        });
    }

    componentSelectionDiv.style.display = 'block';
    document.getElementById('markInputs').style.display = 'none';
}

// Helper: Create variant selector for a single paper
function createVariantSelector(paper, label, container, isMarchSeries) {
    const div = document.createElement('div');
    div.style.marginBottom = '10px';

    const labelElem = document.createElement('label');
    labelElem.textContent = `${label} (Paper ${paper}) - Variant: `;
    labelElem.style.display = 'inline-block';
    labelElem.style.width = '250px';

    const select = document.createElement('select');
    select.id = `component_${paper}`;
    select.className = 'component-selector';
    select.required = true;

    if (isMarchSeries) {
        // March series: only variant 2
        const option = document.createElement('option');
        option.value = paper + '2';
        option.textContent = `Variant 2 (${paper}2)`;
        option.selected = true;
        select.appendChild(option);
        select.disabled = true; // Lock it
    } else {
        // Other series: all variants
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select Variant --';
        select.appendChild(defaultOption);

        VARIANTS.forEach(variant => {
            const option = document.createElement('option');
            option.value = paper + variant;
            option.textContent = `Variant ${variant} (${paper}${variant})`;
            select.appendChild(option);
        });
    }

    select.addEventListener('change', checkAllComponentsSelected);

    div.appendChild(labelElem);
    div.appendChild(select);
    container.appendChild(div);
}

// Helper: Create practical paper choice (5 or 6)
function createPracticalSelector(practicalOptions, container, isMarchSeries) {
    const div = document.createElement('div');
    div.style.marginBottom = '10px';

    const labelElem = document.createElement('label');
    labelElem.textContent = 'Practical Paper: ';
    labelElem.style.display = 'inline-block';
    labelElem.style.width = '250px';

    const select = document.createElement('select');
    select.id = 'component_practical';
    select.className = 'component-selector';
    select.required = true;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Choose Paper 5 or 6 --';
    select.appendChild(defaultOption);

    practicalOptions.forEach(paper => {
        if (isMarchSeries) {
            // March: only variant 2
            const option = document.createElement('option');
            option.value = paper + '2';
            option.textContent = `Paper ${paper} Variant 2 (${paper}2)`;
            select.appendChild(option);
        } else {
            // Other series: all variants for each paper
            VARIANTS.forEach(variant => {
                const option = document.createElement('option');
                option.value = paper + variant;
                option.textContent = `Paper ${paper} Variant ${variant} (${paper}${variant})`;
                select.appendChild(option);
            });
        }
    });

    select.addEventListener('change', checkAllComponentsSelected);

    div.appendChild(labelElem);
    div.appendChild(select);
    container.appendChild(div);
}

// ========== CHECK ALL COMPONENTS SELECTED ==========

function checkAllComponentsSelected() {
    const subjectSelect = document.getElementById('subject');
    const typeSelect = document.getElementById('paperType');
    const selectedSubject = subjectSelect.value;
    const selectedType = typeSelect.value;
    const subjectData = SUBJECT_PAPERS[selectedSubject];

    selectedComponents = [];
    let allSelected = true;

    if (['0610', '0620', '0625'].includes(selectedSubject)) {
        // Sciences: check MCQ, Theory, and Practical
        const tierData = subjectData[selectedType];
        
        const mcqSelect = document.getElementById(`component_${tierData.mcq}`);
        const theorySelect = document.getElementById(`component_${tierData.theory}`);
        const practicalSelect = document.getElementById('component_practical');

        if (mcqSelect && mcqSelect.value) {
            selectedComponents.push(mcqSelect.value);
        } else {
            allSelected = false;
        }

        if (theorySelect && theorySelect.value) {
            selectedComponents.push(theorySelect.value);
        } else {
            allSelected = false;
        }

        if (practicalSelect && practicalSelect.value) {
            selectedComponents.push(practicalSelect.value);
        } else {
            allSelected = false;
        }

    } else {
        // Other subjects: check all papers
        let papers = [];
        if (subjectData.hasTypes) {
            papers = subjectData[selectedType];
        } else {
            papers = subjectData.papers;
        }

        papers.forEach(paper => {
            const select = document.getElementById(`component_${paper}`);
            if (select && select.value) {
                selectedComponents.push(select.value);
            } else {
                allSelected = false;
            }
        });
    }

    console.log(`Components: ${selectedComponents}, All selected: ${allSelected}`);

    if (allSelected) {
        generateMarkInputs();
    } else {
        document.getElementById('markInputs').style.display = 'none';
    }
}

// ========== GENERATE MARK INPUTS ==========

function generateMarkInputs() {
    const markInputsDiv = document.getElementById('markInputs');
    const markFieldsDiv = document.getElementById('markFields');

    markFieldsDiv.innerHTML = '';

    console.log(`Generating mark inputs for: ${selectedComponents}`);

    selectedComponents.forEach(component => {
        const div = document.createElement('div');
        div.style.marginBottom = '10px';

        const label = document.createElement('label');
        label.textContent = `Component ${component}: `;
        label.style.display = 'inline-block';
        label.style.width = '200px';

        const input = document.createElement('input');
        input.type = 'number';
        input.id = `mark_${component}`;
        input.placeholder = 'Enter marks';
        input.min = '0';
        input.step = '1';
        input.required = true;
        input.style.width = '150px';

        div.appendChild(label);
        div.appendChild(input);
        markFieldsDiv.appendChild(div);
    });

    markInputsDiv.style.display = 'block';
}

// ========== DISPLAY ERROR ==========

function displayError(errorMessage) {
    const resultDiv = document.getElementById('result');
    const resultDetailsDiv = document.getElementById('resultDetails');

    resultDiv.style.display = 'block';
    resultDetailsDiv.innerHTML = `
        <div class="error-card">
            <h3>❌ Error</h3>
            <p>${errorMessage}</p>
            <button onclick="location.reload()">Try Again</button>
        </div>
    `;
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// ========== DISPLAY RESULTS ==========

function displayResults(result) {
    const resultDetailsDiv = document.getElementById('resultDetails');

    let html = `
        <div class="result-card">
            <h3>🎓 Your Result</h3>
            
            <div class="grade-display">
                <strong>Grade:</strong> <span>${result.grade}</span>
            </div>
            
            ${result.pum ? `
                <div class="pum-display">
                    <strong>PUM:</strong> <span>${result.pum}%</span>
                </div>
                
                <div class="result-slip">
                    <strong>Result Slip Format:</strong> ${result.grade} (${result.pum})
                </div>
            ` : ''}
            
            <div style="margin-top: 15px;">
                <strong>Syllabus Total:</strong> ${result.syllabus_total} / ${result.max_total}
            </div>
            
            ${result.option ? `
                <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                    <strong>Grade Threshold Option:</strong> ${result.option}
                </div>
            ` : ''}
        </div>
        
        <div>
            <h4>📊 Component Breakdown</h4>
            <table>
                <thead>
                    <tr>
                        <th>Component</th>
                        <th>Raw Mark</th>
                        <th>SCWF</th>
                        <th>Weighted Mark</th>
                    </tr>
                </thead>
                <tbody>
    `;

    result.details.forEach(detail => {
        html += `
            <tr>
                <td>${detail.Component}</td>
                <td>${detail['Raw Mark']} / ${detail['Max Raw']}</td>
                <td>${detail.SCWF}</td>
                <td>${detail['Weighted Mark']} / ${detail['Max Weighted']}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
        
        ${result.thresholds ? `
            <div>
                <h4>📈 Grade Thresholds</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Grade</th>
                            <th>A*</th>
                            <th>A</th>
                            <th>B</th>
                            <th>C</th>
                            <th>D</th>
                            <th>E</th>
                            <th>F</th>
                            <th>G</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Threshold</strong></td>
                            <td>${result.thresholds['A*'] || '-'}</td>
                            <td>${result.thresholds['A'] || '-'}</td>
                            <td>${result.thresholds['B'] || '-'}</td>
                            <td>${result.thresholds['C'] || '-'}</td>
                            <td>${result.thresholds['D'] || '-'}</td>
                            <td>${result.thresholds['E'] || '-'}</td>
                            <td>${result.thresholds['F'] || '-'}</td>
                            <td>${result.thresholds['G'] || '-'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
` : ''}
        
        <button class="btn-calculate-another" onclick="location.reload()">
            Calculate Another Grade
        </button>
    `;

    resultDetailsDiv.innerHTML = html;
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}

// ========== EVENT LISTENERS ==========

document.addEventListener('DOMContentLoaded', function () {
    console.log('Calculator JavaScript loaded successfully!');

    document.getElementById('subject').addEventListener('change', validateAndUpdateForm);
    document.getElementById('year').addEventListener('change', populateSeasons);
    document.getElementById('season').addEventListener('change', validateAndUpdateForm);
    document.getElementById('paperType').addEventListener('change', validateAndUpdateForm);

    // ========== FORM SUBMISSION ==========

    document.getElementById('calculatorForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        console.log('Form submitted!');

        const subject = document.getElementById('subject').value;
        const season = document.getElementById('season').value;

        // ========== VALIDATION ==========
        let validationErrors = [];
        let rawMarks = [];

        selectedComponents.forEach(component => {
            const markInput = document.getElementById(`mark_${component}`);
            const value = markInput.value.trim();

            if (value === '') {
                validationErrors.push(`Component ${component}: Please enter a mark`);
                return;
            }

            const mark = parseFloat(value);

            if (isNaN(mark)) {
                validationErrors.push(`Component ${component}: Please enter a valid number`);
                return;
            }

            if (mark < 0) {
                validationErrors.push(`Component ${component}: Mark cannot be negative`);
                return;
            }

            // Check decimal places
            if (mark % 1 !== 0) {
                const decimals = value.split('.')[1];
                if (decimals && decimals.length > 2) {
                    validationErrors.push(`Component ${component}: Maximum 2 decimal places`);
                }
            }

            rawMarks.push(mark);
        });

        // Display validation errors if any
        if (validationErrors.length > 0) {
            displayError(validationErrors.join('<br>'));
            return;
        }

        // ========== PREPARE AND SEND DATA ==========

        const requestData = {
            subject_code: subject,
            exam_series: season,
            components: selectedComponents,
            raw_marks: rawMarks
        };

        console.log('Sending to Flask:', requestData);

        // Show loading message
        const resultDiv = document.getElementById('result');
        const resultDetailsDiv = document.getElementById('resultDetails');
        resultDiv.style.display = 'block';
        resultDetailsDiv.innerHTML = '<p>Calculating your grade... ⏳</p>';

        try {
            const response = await fetch('/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            console.log('Flask response:', result);

            if (result.success) {
                displayResults(result);

                // Trigger celebration for A* grade
                if (result.grade === 'A*') {
                    setTimeout(() => {
                        triggerAStarCelebration();
                    }, 500); // Small delay for result to appear first
                }
            }
            else {
                displayError(result.error);
            }

        } catch (error) {
            console.error('Error:', error);
            displayError('Network error. Please check if Flask is running.');
        }
    });
});

// ========== MANUAL MODE FUNCTIONALITY ==========

// Mode switching
// ========== APPLE-STYLE TOGGLE FUNCTIONALITY ========== 
document.querySelectorAll('.toggle-option').forEach(button => {
    button.addEventListener('click', function() {
        const mode = this.getAttribute('data-mode');
        const modeToggle = document.querySelector('.mode-toggle');
        
        // Update active states
        document.querySelectorAll('.toggle-option').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');
        
        // Animate slider
        if (mode === 'manual') {
            modeToggle.classList.add('manual-active');
            document.getElementById('calculatorForm').style.display = 'none';
            document.getElementById('manualModeForm').style.display = 'block';
            document.getElementById('modeDescription').textContent = 
                'Manually enter SCWF values and thresholds for custom calculations';
        } else {
            modeToggle.classList.remove('manual-active');
            document.getElementById('calculatorForm').style.display = 'block';
            document.getElementById('manualModeForm').style.display = 'none';
            document.getElementById('modeDescription').textContent = 
                'Using pre-loaded grade thresholds and SCWF data from Cambridge (for select subjects)';
        }
    });
});


// Generate component inputs for manual mode
document.getElementById('numComponents').addEventListener('change', function () {
    const numComponents = parseInt(this.value);
    const container = document.getElementById('customComponentInputs');
    const thresholdsSection = document.getElementById('customThresholds');

    container.innerHTML = '';

    if (!numComponents) {
        thresholdsSection.style.display = 'none';
        return;
    }

    // Create components in a 2-column grid
    for (let i = 1; i <= numComponents; i++) {
        const div = document.createElement('div');
        div.className = 'component-input-group';
        div.innerHTML = `
            <h4>Component ${i}</h4>
            <div class="compact-grid">
                <div>
                    <label>Component Code</label>
                    <input type="text" id="custom_comp_${i}" placeholder="e.g., 21" required>
                </div>
                <div>
                    <label>SCWF</label>
                    <input type="number" id="custom_scwf_${i}" placeholder="e.g., 1.25" min="0" step="0.01" required>
                </div>
                <div>
                    <label>Your Mark</label>
                    <input type="number" id="custom_mark_${i}" placeholder="e.g., 54" min="0" step="0.5" required>
                </div>
                <div>
                    <label>Max Raw Mark</label>
                    <input type="number" id="custom_maxraw_${i}" placeholder="e.g., 80" min="1" required>
                </div>
            </div>
        `;
        container.appendChild(div);
    }

    thresholdsSection.style.display = 'block';
});

// Handle custom form submission
document.getElementById('customCalculatorForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const numComponents = parseInt(document.getElementById('numComponents').value);

    // Collect component data
    const components = [];
    const marks = [];
    let scwfData = [];

    for (let i = 1; i <= numComponents; i++) {
        const comp = document.getElementById(`custom_comp_${i}`).value;
        const mark = parseFloat(document.getElementById(`custom_mark_${i}`).value);
        const maxRaw = parseFloat(document.getElementById(`custom_maxraw_${i}`).value);
        const scwf = parseFloat(document.getElementById(`custom_scwf_${i}`).value);

        // Auto-calculate Max Weighted Mark
        const maxWeighted = maxRaw * scwf;

        components.push(comp);
        marks.push(mark);
        scwfData.push({
            Component: comp,
            'Max Raw Mark': maxRaw,
            'Max Weighted Mark': maxWeighted,  // Calculated automatically
            SCWF: scwf
        });
    }

    // Collect thresholds
    const thresholds = {};
    const grades = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
    grades.forEach(grade => {
        const input = document.getElementById(`threshold_${grade}`);
        if (input.value) {
            thresholds[grade] = parseFloat(input.value);
        }
    });

    // Validate at least one threshold
    if (Object.keys(thresholds).length === 0) {
        displayError('Please enter at least one grade threshold');
        return;
    }

    const requestData = {
        subject_code: 'CUSTOM',
        exam_series: document.getElementById('customSeries').value || 'Custom',
        components: components,
        raw_marks: marks,
        custom_scwf: scwfData,
        custom_thresholds: thresholds
    };

    console.log('Sending custom calculation:', requestData);

    // Show loading
    const resultDiv = document.getElementById('result');
    const resultDetailsDiv = document.getElementById('resultDetails');
    resultDiv.style.display = 'block';
    resultDetailsDiv.innerHTML = '<p>Calculating your grade... ⏳</p>';

    try {
        const response = await fetch('/calculate_custom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        console.log('Flask response:', result);

        if (result.success) {
            displayResults(result);

            // Trigger celebration for A* grade
            if (result.grade === 'A*') {
                setTimeout(() => {
                    triggerAStarCelebration();
                }, 500); // Small delay for result to appear first
            }
        } else {
            displayError(result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        displayError('Network error. Please check if Flask is running.');
    }
});



console.log('Script.js loaded!');

