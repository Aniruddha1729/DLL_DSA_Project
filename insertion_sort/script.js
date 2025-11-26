/*********************************************************
 * Insertion Sort Visualizer
 * Interactive visualization with step-by-step execution
 *********************************************************/

class InsertionSortVisualizer {
    constructor() {
        this.array = [64, 34, 25, 12, 22, 11, 90];
        this.originalArray = [...this.array];
        this.isSorting = false;
        this.isPaused = false;
        this.animationSpeed = 500; // milliseconds
        
        // Statistics
        this.comparisons = 0;
        this.shifts = 0;
        this.arrayAccess = 0;
        this.currentKey = null;
        
        // Step tracking
        this.currentSteps = [];
        this.currentStepIndex = -1;
        
        this.initializeElements();
        this.bindEvents();
        this.renderArray();
        this.updateStats();
    }

    initializeElements() {
        // Input elements
        this.inputArray = document.getElementById('inputArray');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedLabel = document.getElementById('speedLabel');
        
        // Buttons
        this.btnSetArray = document.getElementById('btnSetArray');
        this.btnRandomize = document.getElementById('btnRandomize');
        this.btnSort = document.getElementById('btnSort');
        this.btnPause = document.getElementById('btnPause');
        this.btnReset = document.getElementById('btnReset');
        
        // Display elements
        this.arrayContainer = document.getElementById('arrayContainer');
        this.comparisonsEl = document.getElementById('comparisons');
        this.shiftsEl = document.getElementById('shifts');
        this.arrayAccessEl = document.getElementById('arrayAccess');
        this.currentKeyEl = document.getElementById('currentKey');
        this.stepsListEl = document.getElementById('stepsList');
        this.stepsOperationLabel = document.getElementById('stepsOperationLabel');
        
        // Set initial input value
        this.inputArray.value = this.array.join(', ');
    }

    bindEvents() {
        this.btnSetArray.addEventListener('click', () => this.setArray());
        this.btnRandomize.addEventListener('click', () => this.randomizeArray());
        this.btnSort.addEventListener('click', () => this.startSort());
        this.btnPause.addEventListener('click', () => this.togglePause());
        this.btnReset.addEventListener('click', () => this.reset());
        
        this.speedSlider.addEventListener('input', (e) => this.updateSpeed(e.target.value));
        
        this.inputArray.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setArray();
        });
    }

    setArray() {
        if (this.isSorting) return;
        
        const input = this.inputArray.value.trim();
        const values = input.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
        
        if (values.length === 0) {
            this.showError('Please enter valid numbers');
            return;
        }
        
        if (values.length > 20) {
            this.showError('Maximum 20 elements allowed');
            return;
        }
        
        this.array = values;
        this.originalArray = [...this.array];
        this.renderArray();
        this.resetStats();
        this.clearSteps();
        this.setOperationLabel('Array set. Ready to sort.');
    }

    randomizeArray() {
        if (this.isSorting) return;
        
        const size = 8 + Math.floor(Math.random() * 5); // 8-12 elements
        this.array = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
        this.originalArray = [...this.array];
        this.inputArray.value = this.array.join(', ');
        this.renderArray();
        this.resetStats();
        this.clearSteps();
        this.setOperationLabel('Random array generated. Ready to sort.');
    }

    updateSpeed(value) {
        const speeds = {
            1: { ms: 1500, label: 'Very Slow' },
            2: { ms: 1200, label: 'Slow' },
            3: { ms: 900, label: 'Slow' },
            4: { ms: 700, label: 'Normal' },
            5: { ms: 500, label: 'Medium' },
            6: { ms: 350, label: 'Medium' },
            7: { ms: 200, label: 'Fast' },
            8: { ms: 100, label: 'Fast' },
            9: { ms: 50, label: 'Very Fast' },
            10: { ms: 20, label: 'Ultra Fast' }
        };
        
        const speed = speeds[value];
        this.animationSpeed = speed.ms;
        this.speedLabel.textContent = speed.label;
    }

    async startSort() {
        if (this.isSorting) return;
        
        this.isSorting = true;
        this.isPaused = false;
        this.btnSort.disabled = true;
        this.btnPause.disabled = false;
        this.btnSetArray.disabled = true;
        this.btnRandomize.disabled = true;
        
        this.resetStats();
        this.setOperationLabel('Sorting...');
        
        await this.insertionSort();
        
        this.isSorting = false;
        this.btnSort.disabled = false;
        this.btnPause.disabled = true;
        this.btnPause.textContent = 'Pause';
        this.btnSetArray.disabled = false;
        this.btnRandomize.disabled = false;
        this.setOperationLabel('Sorting complete!');
        this.currentKeyEl.textContent = '-';
        
        // Mark all as sorted
        this.markAllSorted();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.btnPause.textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    async insertionSort() {
        const n = this.array.length;
        
        // First element is already sorted
        this.markSorted(0);
        this.addStep('Start: First element arr[0] is already sorted');
        await this.sleep(this.animationSpeed);
        
        // Start from second element
        for (let i = 1; i < n; i++) {
            if (!this.isSorting) break;
            
            // Wait if paused
            while (this.isPaused && this.isSorting) {
                await this.sleep(100);
            }
            
            const key = this.array[i];
            this.currentKey = key;
            this.currentKeyEl.textContent = key;
            this.arrayAccess++;
            this.updateStats();
            
            // Highlight the key element
            this.highlightKey(i);
            this.addStep(`Iteration ${i}: Pick key = arr[${i}] = ${key}`);
            await this.sleep(this.animationSpeed);
            
            let j = i - 1;
            
            // Find correct position for key by shifting larger elements
            this.addStep(`Compare key (${key}) with sorted portion`);
            
            while (j >= 0) {
                if (!this.isSorting) break;
                
                // Wait if paused
                while (this.isPaused && this.isSorting) {
                    await this.sleep(100);
                }
                
                // Highlight comparison
                this.highlightComparison(j, i);
                this.comparisons++;
                this.arrayAccess++;
                this.updateStats();
                
                this.addStep(`Compare: arr[${j}] (${this.array[j]}) vs key (${key})`);
                await this.sleep(this.animationSpeed);
                
                if (this.array[j] > key) {
                    // Shift element to the right
                    this.addStep(`${this.array[j]} > ${key}: Shift arr[${j}] to arr[${j + 1}]`);
                    
                    this.highlightShift(j, j + 1);
                    await this.sleep(this.animationSpeed / 2);
                    
                    this.array[j + 1] = this.array[j];
                    this.shifts++;
                    this.arrayAccess += 2;
                    this.updateStats();
                    
                    this.renderArray();
                    this.highlightShift(j, j + 1);
                    this.highlightKey(j); // Key position moves back
                    
                    await this.sleep(this.animationSpeed / 2);
                    j--;
                } else {
                    this.addStep(`${this.array[j]} ≤ ${key}: Found correct position`);
                    break;
                }
                
                this.clearHighlights();
            }
            
            // Insert key at correct position
            const insertPos = j + 1;
            this.array[insertPos] = key;
            this.arrayAccess++;
            this.updateStats();
            
            this.addStep(`Insert key (${key}) at position ${insertPos}`);
            this.renderArray();
            this.highlightInsert(insertPos);
            
            await this.sleep(this.animationSpeed);
            
            // Mark elements from 0 to i as sorted
            for (let k = 0; k <= i; k++) {
                this.markSorted(k);
            }
            
            this.clearHighlights();
            this.addStep(`Elements 0 to ${i} are now sorted`);
            await this.sleep(this.animationSpeed / 2);
        }
    }

    renderArray() {
        this.arrayContainer.innerHTML = '';
        
        const maxValue = Math.max(...this.array);
        const containerHeight = 300;
        
        this.array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.dataset.index = index;
            
            const heightPercent = (value / maxValue) * 100;
            const height = (containerHeight - 40) * (heightPercent / 100);
            
            bar.style.height = `${height}px`;
            
            const valueLabel = document.createElement('div');
            valueLabel.className = 'barValue';
            valueLabel.textContent = value;
            
            bar.appendChild(valueLabel);
            this.arrayContainer.appendChild(bar);
        });
    }

    highlightKey(index) {
        this.clearHighlights();
        const bar = this.arrayContainer.querySelector(`[data-index="${index}"]`);
        if (bar) bar.classList.add('key');
    }

    highlightComparison(index1, index2) {
        this.clearHighlights();
        const bar1 = this.arrayContainer.querySelector(`[data-index="${index1}"]`);
        const bar2 = this.arrayContainer.querySelector(`[data-index="${index2}"]`);
        
        if (bar1) bar1.classList.add('comparing');
        if (bar2) bar2.classList.add('key');
    }

    highlightShift(fromIndex, toIndex) {
        const bar1 = this.arrayContainer.querySelector(`[data-index="${fromIndex}"]`);
        const bar2 = this.arrayContainer.querySelector(`[data-index="${toIndex}"]`);
        
        if (bar1) bar1.classList.add('shifting');
        if (bar2) bar2.classList.add('shifting');
    }

    highlightInsert(index) {
        this.clearHighlights();
        const bar = this.arrayContainer.querySelector(`[data-index="${index}"]`);
        if (bar) bar.classList.add('inserting');
    }

    clearHighlights() {
        const bars = this.arrayContainer.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.classList.remove('comparing', 'key', 'shifting', 'inserting');
        });
    }

    markSorted(index) {
        const bar = this.arrayContainer.querySelector(`[data-index="${index}"]`);
        if (bar) {
            bar.classList.remove('comparing', 'key', 'shifting', 'inserting');
            bar.classList.add('sorted');
        }
    }

    markAllSorted() {
        const bars = this.arrayContainer.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            setTimeout(() => {
                bar.classList.add('sorted');
            }, index * 50);
        });
    }

    addStep(stepText) {
        const li = document.createElement('li');
        li.className = 'step current';
        li.innerHTML = `
            <span class="stepBadge">→</span>
            <div class="stepText">${stepText}</div>
        `;
        
        // Mark previous step as done
        const steps = this.stepsListEl.querySelectorAll('.step');
        steps.forEach(step => {
            step.classList.remove('current');
            step.classList.add('done');
        });
        
        this.stepsListEl.appendChild(li);
        
        // Auto-scroll to bottom
        this.stepsListEl.scrollTop = this.stepsListEl.scrollHeight;
        
        // Limit to last 50 steps
        if (this.stepsListEl.children.length > 50) {
            this.stepsListEl.removeChild(this.stepsListEl.firstChild);
        }
    }

    clearSteps() {
        this.stepsListEl.innerHTML = '';
    }

    setOperationLabel(text) {
        this.stepsOperationLabel.textContent = text;
    }

    resetStats() {
        this.comparisons = 0;
        this.shifts = 0;
        this.arrayAccess = 0;
        this.currentKey = null;
        this.currentKeyEl.textContent = '-';
        this.updateStats();
    }

    updateStats() {
        this.comparisonsEl.textContent = this.comparisons;
        this.shiftsEl.textContent = this.shifts;
        this.arrayAccessEl.textContent = this.arrayAccess;
    }

    reset() {
        this.isSorting = false;
        this.isPaused = false;
        this.array = [...this.originalArray];
        this.inputArray.value = this.array.join(', ');
        this.renderArray();
        this.resetStats();
        this.clearSteps();
        this.btnSort.disabled = false;
        this.btnPause.disabled = true;
        this.btnPause.textContent = 'Pause';
        this.btnSetArray.disabled = false;
        this.btnRandomize.disabled = false;
        this.setOperationLabel('Reset complete. Ready to sort.');
    }

    showError(message) {
        const originalBorder = this.inputArray.style.border;
        this.inputArray.style.border = '2px solid var(--danger)';
        setTimeout(() => {
            this.inputArray.style.border = originalBorder;
        }, 1000);
        this.setOperationLabel(message);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the visualizer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InsertionSortVisualizer();
});
