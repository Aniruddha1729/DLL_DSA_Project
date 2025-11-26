/*********************************************************
 * Quick Sort Visualizer
 * Interactive visualization with step-by-step execution
 *********************************************************/

class QuickSortVisualizer {
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
        this.recursionDepth = 0;
        this.maxRecursionDepth = 0;
        
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
        this.recursionDepthEl = document.getElementById('recursionDepth');
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
        
        this.addStep('🚀 Starting Quick Sort Algorithm...', 'phase');
        this.addStep(`📋 Initial Array: [${this.array.join(', ')}]`, 'info');
        await this.sleep(this.animationSpeed);
        await this.quickSort(0, this.array.length - 1, 0);
        
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

    async quickSort(low, high, depth = 0) {
        if (!this.isSorting || low >= high) {
            if (low === high && this.isSorting) {
                this.markSorted(low);
            }
            return;
        }
        
        this.recursionDepth++;
        this.maxRecursionDepth = Math.max(this.maxRecursionDepth, this.recursionDepth);
        this.updateStats();
        
        // Wait if paused
        while (this.isPaused && this.isSorting) {
            await this.sleep(100);
        }
        
        const indent = '  '.repeat(depth);
        const rangeValues = this.array.slice(low, high + 1).join(', ');
        
        // Highlight the current partition range with depth
        this.highlightPartition(low, high, depth);
        this.addStep(`${indent}📍 QuickSort(${low}, ${high}) - Working on [${rangeValues}]`, 'phase');
        await this.sleep(this.animationSpeed * 1.5);
        
        // Partition the array
        const pivotIndex = await this.partition(low, high, depth);
        
        if (this.isSorting && pivotIndex !== -1) {
            // Mark pivot as sorted
            this.markSorted(pivotIndex);
            this.addStep(`${indent}✅ Pivot ${this.array[pivotIndex]} placed at position ${pivotIndex}`, 'success');
            await this.sleep(this.animationSpeed);
            
            // Show left and right partitions
            if (pivotIndex - 1 >= low || pivotIndex + 1 <= high) {
                const leftPart = pivotIndex - 1 >= low ? this.array.slice(low, pivotIndex).join(', ') : 'none';
                const rightPart = pivotIndex + 1 <= high ? this.array.slice(pivotIndex + 1, high + 1).join(', ') : 'none';
                this.addStep(`${indent}📊 Left: [${leftPart}] | Pivot: ${this.array[pivotIndex]} | Right: [${rightPart}]`, 'info');
                await this.sleep(this.animationSpeed / 2);
            }
            
            // Recursively sort left partition
            if (pivotIndex - 1 > low) {
                this.addStep(`${indent}⬅️ Going LEFT to sort [${low}...${pivotIndex - 1}]`, 'recurse');
                await this.sleep(this.animationSpeed / 2);
                await this.quickSort(low, pivotIndex - 1, depth + 1);
            } else if (pivotIndex - 1 === low) {
                this.markSorted(low);
                this.addStep(`${indent}  ✓ Single element at ${low} is sorted`, 'minor');
            }
            
            // Recursively sort right partition
            if (pivotIndex + 1 < high) {
                this.addStep(`${indent}➡️ Going RIGHT to sort [${pivotIndex + 1}...${high}]`, 'recurse');
                await this.sleep(this.animationSpeed / 2);
                await this.quickSort(pivotIndex + 1, high, depth + 1);
            } else if (pivotIndex + 1 === high) {
                this.markSorted(high);
                this.addStep(`${indent}  ✓ Single element at ${high} is sorted`, 'minor');
            }
            
            this.addStep(`${indent}🎯 Completed range [${low}...${high}]`, 'complete');
        }
        
        this.recursionDepth--;
        this.updateStats();
    }

    async partition(low, high, depth = 0) {
        if (!this.isSorting) return -1;
        
        const indent = '  '.repeat(depth);
        const pivot = this.array[high];
        this.arrayAccess++;
        this.updateStats();
        
        // Highlight pivot
        this.highlightPivot(high, depth);
        this.addStep(`${indent}  🎯 Partition: Pivot = arr[${high}] = ${pivot}`, 'partition');
        await this.sleep(this.animationSpeed);
        
        let i = low - 1;
        this.addStep(`${indent}  📌 Partition index i = ${i}`, 'partition');
        await this.sleep(this.animationSpeed / 2);
        
        for (let j = low; j < high; j++) {
            if (!this.isSorting) return -1;
            
            // Wait if paused
            while (this.isPaused && this.isSorting) {
                await this.sleep(100);
            }
            
            // Highlight comparison with partition boundary
            this.highlightComparison(j, high, i, depth);
            this.comparisons++;
            this.arrayAccess++;
            this.updateStats();
            
            this.addStep(`${indent}    🔍 arr[${j}]=${this.array[j]} vs pivot=${pivot}`);
            await this.sleep(this.animationSpeed);
            
            if (this.array[j] < pivot) {
                i++;
                
                if (i !== j) {
                    this.addStep(`${indent}    ✓ ${this.array[j]} < ${pivot}: Move to left partition (i=${i})`, 'swap');
                    
                    // Highlight swap
                    this.highlightSwap(i, j, depth);
                    await this.sleep(this.animationSpeed / 2);
                    
                    // Perform swap
                    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
                    this.swaps++;
                    this.arrayAccess += 2;
                    this.updateStats();
                    
                    this.renderArray();
                    this.highlightSwap(i, j, depth);
                    this.highlightPivot(high, depth);
                    this.showPartitionBoundary(i);
                    
                    await this.sleep(this.animationSpeed / 2);
                } else {
                    this.addStep(`${indent}    ✓ ${this.array[j]} < ${pivot}: Already in position`);
                    await this.sleep(this.animationSpeed / 3);
                }
            } else {
                this.addStep(`${indent}    ✗ ${this.array[j]} ≥ ${pivot}: Stay in right partition`);
                await this.sleep(this.animationSpeed / 3);
            }
            
            this.clearHighlights();
            this.highlightPivot(high, depth);
            this.showPartitionBoundary(i);
        }
        
        // Place pivot in correct position
        const pivotIndex = i + 1;
        this.addStep(`${indent}  🎯 Final step: Place pivot at position ${pivotIndex}`, 'partition');
        
        if (pivotIndex !== high) {
            this.highlightSwap(pivotIndex, high, depth);
            await this.sleep(this.animationSpeed / 2);
            
            [this.array[pivotIndex], this.array[high]] = [this.array[high], this.array[pivotIndex]];
            this.swaps++;
            this.arrayAccess += 2;
            this.updateStats();
            
            this.renderArray();
        }
        
        this.clearHighlights();
        return pivotIndex;
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

    highlightPartition(low, high, depth) {
        this.clearHighlights();
        for (let i = low; i <= high; i++) {
            const bar = this.arrayContainer.querySelector(`[data-index="${i}"]`);
            if (bar) {
                bar.classList.add('partition');
                bar.style.setProperty('--depth', depth);
            }
        }
    }

    highlightPivot(index, depth) {
        const bar = this.arrayContainer.querySelector(`[data-index="${index}"]`);
        if (bar) {
            bar.classList.remove('partition', 'comparing', 'swapping');
            bar.classList.add('pivot');
            bar.style.setProperty('--depth', depth);
        }
    }

    highlightComparison(index1, index2, partitionIndex, depth) {
        const bar1 = this.arrayContainer.querySelector(`[data-index="${index1}"]`);
        const bar2 = this.arrayContainer.querySelector(`[data-index="${index2}"]`);
        
        if (bar1) {
            bar1.classList.remove('partition');
            bar1.classList.add('comparing');
            bar1.style.setProperty('--depth', depth);
        }
        if (bar2) {
            bar2.classList.remove('partition');
            bar2.classList.add('pivot');
            bar2.style.setProperty('--depth', depth);
        }
        
        // Show partition boundary
        if (partitionIndex >= 0) {
            this.showPartitionBoundary(partitionIndex);
        }
    }

    highlightSwap(index1, index2, depth) {
        const bar1 = this.arrayContainer.querySelector(`[data-index="${index1}"]`);
        const bar2 = this.arrayContainer.querySelector(`[data-index="${index2}"]`);
        
        if (bar1) {
            bar1.classList.remove('partition', 'comparing');
            bar1.classList.add('swapping');
            bar1.style.setProperty('--depth', depth);
        }
        if (bar2) {
            bar2.classList.remove('partition', 'comparing', 'pivot');
            bar2.classList.add('swapping');
            bar2.style.setProperty('--depth', depth);
        }
    }

    showPartitionBoundary(partitionIndex) {
        // Add visual separator after partition index
        const bars = this.arrayContainer.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            if (index <= partitionIndex) {
                bar.classList.add('left-partition');
            } else {
                bar.classList.remove('left-partition');
            }
        });
    }

    clearHighlights() {
        const bars = this.arrayContainer.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.classList.remove('partition', 'pivot', 'comparing', 'swapping');
        });
    }

    markSorted(index) {
        const bar = this.arrayContainer.querySelector(`[data-index="${index}"]`);
        if (bar) {
            bar.classList.remove('partition', 'pivot', 'comparing', 'swapping');
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

    addStep(stepText, type = 'default') {
        const li = document.createElement('li');
        li.className = `step current step-${type}`;
        
        const badges = {
            phase: '📍',
            partition: '🎯',
            swap: '🔄',
            recurse: '🔁',
            success: '✅',
            complete: '🎉',
            info: '📊',
            minor: '•',
            default: '→'
        };
        
        li.innerHTML = `
            <span class="stepBadge">${badges[type] || badges.default}</span>
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
        
        // Limit to last 100 steps
        if (this.stepsListEl.children.length > 100) {
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
        this.recursionDepth = 0;
        this.maxRecursionDepth = 0;
        this.updateStats();
    }

    updateStats() {
        this.comparisonsEl.textContent = this.comparisons;
        this.swapsEl.textContent = this.swaps;
        this.arrayAccessEl.textContent = this.arrayAccess;
        this.recursionDepthEl.textContent = this.maxRecursionDepth;
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
    new QuickSortVisualizer();
});
