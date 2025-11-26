/*********************************************************
 * Bubble Sort Visualizer
 * Interactive visualization with step-by-step execution
 *********************************************************/

class BubbleSortVisualizer {
    constructor() {
        this.array = [64, 34, 25, 12, 22, 11, 90];
        this.originalArray = [...this.array];
        this.isSorting = false;
        this.isPaused = false;
        this.animationSpeed = 500; // milliseconds
        
        // Statistics
        this.comparisons = 0;
        this.swaps = 0;
        this.arrayAccess = 0;
        this.currentPass = 0;
        
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
        this.swapsEl = document.getElementById('swaps');
        this.arrayAccessEl = document.getElementById('arrayAccess');
        this.currentPassEl = document.getElementById('currentPass');
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
        
        await this.bubbleSort();
        
        this.isSorting = false;
        this.btnSort.disabled = false;
        this.btnPause.disabled = true;
        this.btnPause.textContent = 'Pause';
        this.btnSetArray.disabled = false;
        this.btnRandomize.disabled = false;
        this.setOperationLabel('Sorting complete!');
        
        // Mark all as sorted
        this.markAllSorted();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.btnPause.textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    async bubbleSort() {
        const n = this.array.length;
        
        for (let i = 0; i < n - 1; i++) {
            if (!this.isSorting) break;
            
            this.currentPass = i + 1;
            this.updateStats();
            
            let swapped = false;
            
            this.addStep(`Pass ${i + 1}: Comparing adjacent elements`);
            
            for (let j = 0; j < n - i - 1; j++) {
                if (!this.isSorting) break;
                
                // Wait if paused
                while (this.isPaused && this.isSorting) {
                    await this.sleep(100);
                }
                
                // Highlight elements being compared
                this.highlightElements(j, j + 1, 'comparing');
                this.arrayAccess += 2;
                this.comparisons++;
                this.updateStats();
                
                this.addStep(`Compare: arr[${j}] (${this.array[j]}) vs arr[${j + 1}] (${this.array[j + 1]})`);
                
                await this.sleep(this.animationSpeed);
                
                // Check if swap is needed
                if (this.array[j] > this.array[j + 1]) {
                    // Highlight swap
                    this.highlightElements(j, j + 1, 'swapping');
                    this.addStep(`Swap: ${this.array[j]} > ${this.array[j + 1]} - Swapping!`);
                    
                    await this.sleep(this.animationSpeed / 2);
                    
                    // Perform swap
                    [this.array[j], this.array[j + 1]] = [this.array[j + 1], this.array[j]];
                    this.swaps++;
                    this.arrayAccess += 2;
                    this.updateStats();
                    
                    this.renderArray();
                    this.highlightElements(j, j + 1, 'swapping');
                    
                    await this.sleep(this.animationSpeed / 2);
                    swapped = true;
                } else {
                    this.addStep(`No swap needed: ${this.array[j]} ≤ ${this.array[j + 1]}`);
                }
                
                // Remove highlighting
                this.clearHighlights();
            }
            
            // Mark the last element of this pass as sorted
            this.markSorted(n - i - 1);
            this.addStep(`Element at position ${n - i - 1} is now in final position`);
            
            // Early termination if no swaps occurred
            if (!swapped) {
                this.addStep('No swaps in this pass - Array is sorted!');
                // Mark remaining elements as sorted
                for (let k = 0; k < n - i - 1; k++) {
                    this.markSorted(k);
                }
                break;
            }
            
            await this.sleep(this.animationSpeed);
        }
        
        // Mark first element as sorted
        if (this.isSorting && this.array.length > 0) {
            this.markSorted(0);
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

    highlightElements(index1, index2, type) {
        this.clearHighlights();
        
        const bar1 = this.arrayContainer.querySelector(`[data-index="${index1}"]`);
        const bar2 = this.arrayContainer.querySelector(`[data-index="${index2}"]`);
        
        if (bar1) bar1.classList.add(type);
        if (bar2) bar2.classList.add(type);
    }

    clearHighlights() {
        const bars = this.arrayContainer.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.classList.remove('comparing', 'swapping');
        });
    }

    markSorted(index) {
        const bar = this.arrayContainer.querySelector(`[data-index="${index}"]`);
        if (bar) {
            bar.classList.remove('comparing', 'swapping');
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
        this.swaps = 0;
        this.arrayAccess = 0;
        this.currentPass = 0;
        this.updateStats();
    }

    updateStats() {
        this.comparisonsEl.textContent = this.comparisons;
        this.swapsEl.textContent = this.swaps;
        this.arrayAccessEl.textContent = this.arrayAccess;
        this.currentPassEl.textContent = this.currentPass;
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
    new BubbleSortVisualizer();
});
