class DoublyLinkedListNode {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;
        this.id = Math.random().toString(36).substr(2, 9);
        this.element = null;
    }
}

class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    insertAtHead(data) {
        const newNode = new DoublyLinkedListNode(data);
        
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        
        this.size++;
        return newNode;
    }

    insertAtTail(data) {
        const newNode = new DoublyLinkedListNode(data);
        
        if (!this.tail) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }
        
        this.size++;
        return newNode;
    }

    insertAfter(targetNode, data) {
        const newNode = new DoublyLinkedListNode(data);
        
        if (targetNode === this.tail) {
            return this.insertAtTail(data);
        }
        
        newNode.next = targetNode.next;
        newNode.prev = targetNode;
        targetNode.next.prev = newNode;
        targetNode.next = newNode;
        
        this.size++;
        return newNode;
    }

    insertBefore(targetNode, data) {
        const newNode = new DoublyLinkedListNode(data);
        
        if (targetNode === this.head) {
            return this.insertAtHead(data);
        }
        
        newNode.prev = targetNode.prev;
        newNode.next = targetNode;
        targetNode.prev.next = newNode;
        targetNode.prev = newNode;
        
        this.size++;
        return newNode;
    }

    delete(targetNode) {
        if (this.size === 1) {
            this.head = null;
            this.tail = null;
        } else if (targetNode === this.head) {
            this.head = this.head.next;
            this.head.prev = null;
        } else if (targetNode === this.tail) {
            this.tail = this.tail.prev;
            this.tail.next = null;
        } else {
            targetNode.prev.next = targetNode.next;
            targetNode.next.prev = targetNode.prev;
        }
        
        this.size--;
    }

    clear() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    toArray() {
        const result = [];
        let current = this.head;
        while (current) {
            result.push(current);
            current = current.next;
        }
        return result;
    }
}

class DLLVisualizer {
    constructor() {
        this.dll = new DoublyLinkedList();
        this.selectedNode = null;
        this.animationDelay = 800;
        this.nodeSpacing = 120;
        this.nodeStartX = 50;
        this.nodeY = 95;
        
        this.initializeElements();
        this.bindEvents();
        this.updateVisualization();
    }

    initializeElements() {
        this.stage = document.getElementById('stage');
        this.arrowLayer = document.getElementById('arrowLayer');
        this.inputValue = document.getElementById('inputValue');
        this.btnInsertAtHead = document.getElementById('btnInsertAtHead');
        this.btnInsertAtTail = document.getElementById('btnInsertAtTail');
        this.btnInsertAfter = document.getElementById('btnInsertAfter');
        this.btnInsertBefore = document.getElementById('btnInsertBefore');
        this.btnDelete = document.getElementById('btnDelete');
        this.btnReset = document.getElementById('btnReset');
        this.stepsList = document.getElementById('stepsList');
        this.stepsOperationLabel = document.getElementById('stepsOperationLabel');
        this.codePanel = document.getElementById('codePanel');
    }

    bindEvents() {
        this.btnInsertAtHead.addEventListener('click', () => this.insertAtHead());
        this.btnInsertAtTail.addEventListener('click', () => this.insertAtTail());
        this.btnInsertAfter.addEventListener('click', () => this.insertAfter());
        this.btnInsertBefore.addEventListener('click', () => this.insertBefore());
        this.btnDelete.addEventListener('click', () => this.deleteNode());
        this.btnReset.addEventListener('click', () => this.reset());
        
        this.inputValue.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.insertAtTail();
            }
        });
    }

    async insertAtHead() {
        const value = this.getInputValue();
        if (value === null) return;

        this.clearSteps();
        this.setOperationLabel('Insert at Head');
        
        const steps = [
            'Create new node with value ' + value,
            'Check if list is empty',
            this.dll.size === 0 ? 'List is empty, set as head and tail' : 'Set new node as head',
            'Update previous head\'s prev pointer',
            'Operation completed'
        ];
        
        this.displaySteps(steps);
        
        const newNode = this.dll.insertAtHead(value);
        await this.animateInsertion(newNode, 0);
        
        this.updateVisualization();
        this.updateCodePanel('insertAtHead', value);
        this.markStepComplete();
    }

    async insertAtTail() {
        const value = this.getInputValue();
        if (value === null) return;

        this.clearSteps();
        this.setOperationLabel('Insert at Tail');
        
        const steps = [
            'Create new node with value ' + value,
            'Check if list is empty',
            this.dll.size === 0 ? 'List is empty, set as head and tail' : 'Set new node as tail',
            'Update previous tail\'s next pointer',
            'Operation completed'
        ];
        
        this.displaySteps(steps);
        
        const newNode = this.dll.insertAtTail(value);
        await this.animateInsertion(newNode, this.dll.size - 1);
        
        this.updateVisualization();
        this.updateCodePanel('insertAtTail', value);
        this.markStepComplete();
    }

    async insertAfter() {
        if (!this.selectedNode) return;
        
        const value = this.getInputValue();
        if (value === null) return;

        this.clearSteps();
        this.setOperationLabel('Insert After Selected');
        
        const steps = [
            'Create new node with value ' + value,
            'Link new node to selected node\'s next',
            'Update selected node\'s next pointer',
            'Update next node\'s prev pointer',
            'Operation completed'
        ];
        
        this.displaySteps(steps);
        
        const position = this.getNodePosition(this.selectedNode) + 1;
        const newNode = this.dll.insertAfter(this.selectedNode, value);
        await this.animateInsertion(newNode, position);
        
        this.updateVisualization();
        this.updateCodePanel('insertAfter', value);
        this.markStepComplete();
    }

    async insertBefore() {
        if (!this.selectedNode) return;
        
        const value = this.getInputValue();
        if (value === null) return;

        this.clearSteps();
        this.setOperationLabel('Insert Before Selected');
        
        const steps = [
            'Create new node with value ' + value,
            'Link new node to selected node\'s prev',
            'Update selected node\'s prev pointer',
            'Update previous node\'s next pointer',
            'Operation completed'
        ];
        
        this.displaySteps(steps);
        
        const position = this.getNodePosition(this.selectedNode);
        const newNode = this.dll.insertBefore(this.selectedNode, value);
        await this.animateInsertion(newNode, position);
        
        this.updateVisualization();
        this.updateCodePanel('insertBefore', value);
        this.markStepComplete();
    }

    async deleteNode() {
        if (!this.selectedNode) return;

        this.clearSteps();
        this.setOperationLabel('Delete Selected Node');
        
        const steps = [
            'Locate node to delete',
            'Update previous node\'s next pointer',
            'Update next node\'s prev pointer',
            'Remove node from memory',
            'Operation completed'
        ];
        
        this.displaySteps(steps);
        
        await this.animateDeletion(this.selectedNode);
        this.dll.delete(this.selectedNode);
        
        this.selectedNode = null;
        this.updateVisualization();
        this.updateCodePanel('delete');
        this.markStepComplete();
    }

    reset() {
        this.dll.clear();
        this.selectedNode = null;
        this.stage.innerHTML = '<svg id="arrowLayer"></svg>';
        this.arrowLayer = document.getElementById('arrowLayer');
        this.updateVisualization();
        this.clearSteps();
        this.setOperationLabel('Idle');
        this.updateCodePanel('reset');
    }

    getInputValue() {
        const value = parseInt(this.inputValue.value);
        if (isNaN(value) || value < 0 || value > 99) {
            alert('Please enter a valid number between 0 and 99');
            return null;
        }
        this.inputValue.value = '';
        return value;
    }

    getNodePosition(node) {
        const nodes = this.dll.toArray();
        return nodes.findIndex(n => n.id === node.id);
    }

    async animateInsertion(node, position) {
        const nodeElement = this.createNodeElement(node);
        nodeElement.classList.add('highlight');
        
        // Position the node
        const x = this.nodeStartX + (position * this.nodeSpacing);
        nodeElement.style.left = x + 'px';
        nodeElement.style.top = this.nodeY + 'px';
        
        this.stage.appendChild(nodeElement);
        node.element = nodeElement;
        
        // Add event listener for selection
        nodeElement.addEventListener('click', () => this.selectNode(node));
        
        await this.sleep(this.animationDelay);
        nodeElement.classList.remove('highlight');
    }

    async animateDeletion(node) {
        if (node.element) {
            node.element.classList.add('deleted');
            await this.sleep(this.animationDelay);
            node.element.remove();
        }
    }

    createNodeElement(node) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'node';
        nodeElement.textContent = node.data;
        nodeElement.id = 'node-' + node.id;
        return nodeElement;
    }

    selectNode(node) {
        // Remove previous selection
        if (this.selectedNode && this.selectedNode.element) {
            this.selectedNode.element.classList.remove('selected');
        }
        
        // Select new node
        this.selectedNode = node;
        node.element.classList.add('selected');
        
        // Enable/disable buttons
        this.updateButtonStates();
    }

    updateButtonStates() {
        const hasSelection = this.selectedNode !== null;
        this.btnInsertAfter.disabled = !hasSelection;
        this.btnInsertBefore.disabled = !hasSelection;
        this.btnDelete.disabled = !hasSelection;
    }

    updateVisualization() {
        // Clear existing nodes
        const existingNodes = this.stage.querySelectorAll('.node');
        existingNodes.forEach(node => node.remove());
        
        // Clear arrows
        this.arrowLayer.innerHTML = '';
        
        const nodes = this.dll.toArray();
        
        // Create and position nodes
        nodes.forEach((node, index) => {
            const nodeElement = this.createNodeElement(node);
            const x = this.nodeStartX + (index * this.nodeSpacing);
            
            nodeElement.style.left = x + 'px';
            nodeElement.style.top = this.nodeY + 'px';
            
            // Add head/tail classes
            if (node === this.dll.head) nodeElement.classList.add('head');
            if (node === this.dll.tail) nodeElement.classList.add('tail');
            
            // Restore selection
            if (this.selectedNode && node.id === this.selectedNode.id) {
                nodeElement.classList.add('selected');
                this.selectedNode = node; // Update reference
            }
            
            this.stage.appendChild(nodeElement);
            node.element = nodeElement;
            
            // Add click event
            nodeElement.addEventListener('click', () => this.selectNode(node));
        });
        
        // Draw arrows
        this.drawArrows(nodes);
        
        // Update button states
        this.updateButtonStates();
        
        // Adjust stage width
        if (nodes.length > 0) {
            const minWidth = (nodes.length * this.nodeSpacing) + 100;
            this.stage.style.minWidth = minWidth + 'px';
        }
    }

    drawArrows(nodes) {
        if (nodes.length === 0) return;
        
        const svgNS = 'http://www.w3.org/2000/svg';
        
        nodes.forEach((node, index) => {
            const x = this.nodeStartX + (index * this.nodeSpacing);
            
            // Forward arrow (next pointer)
            if (node.next) {
                const nextX = this.nodeStartX + ((index + 1) * this.nodeSpacing);
                const arrow = this.createArrow(x + 80, this.nodeY + 20, nextX, this.nodeY + 20, 'arrow-forward');
                this.arrowLayer.appendChild(arrow);
            } else {
                // Null pointer for next
                const nullArrow = this.createArrow(x + 80, this.nodeY + 20, x + 110, this.nodeY + 20, 'arrow-null');
                this.arrowLayer.appendChild(nullArrow);
            }
            
            // Backward arrow (prev pointer)
            if (node.prev) {
                const prevX = this.nodeStartX + ((index - 1) * this.nodeSpacing);
                const arrow = this.createArrow(x, this.nodeY + 40, prevX + 80, this.nodeY + 40, 'arrow-backward');
                this.arrowLayer.appendChild(arrow);
            } else {
                // Null pointer for prev
                const nullArrow = this.createArrow(x, this.nodeY + 40, x - 30, this.nodeY + 40, 'arrow-null');
                this.arrowLayer.appendChild(nullArrow);
            }
        });
    }

    createArrow(x1, y1, x2, y2, className) {
        const svgNS = 'http://www.w3.org/2000/svg';
        
        // Create line
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.classList.add('arrow', className);
        
        // Create arrowhead
        const arrowhead = document.createElementNS(svgNS, 'polygon');
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowLength = 8;
        const arrowWidth = 4;
        
        const headX = x2 - arrowLength * Math.cos(angle);
        const headY = y2 - arrowLength * Math.sin(angle);
        
        const points = [
            [x2, y2],
            [headX + arrowWidth * Math.sin(angle), headY - arrowWidth * Math.cos(angle)],
            [headX - arrowWidth * Math.sin(angle), headY + arrowWidth * Math.cos(angle)]
        ];
        
        arrowhead.setAttribute('points', points.map(p => p.join(',')).join(' '));
        arrowhead.classList.add('arrow', className);
        arrowhead.style.fill = getComputedStyle(line).stroke;
        
        // Group line and arrowhead
        const group = document.createElementNS(svgNS, 'g');
        group.appendChild(line);
        group.appendChild(arrowhead);
        
        return group;
    }

    displaySteps(steps) {
        this.stepsList.innerHTML = '';
        steps.forEach((step, index) => {
            const li = document.createElement('li');
            li.textContent = step;
            li.classList.add('step', index === 0 ? 'current' : 'pending');
            this.stepsList.appendChild(li);
        });
    }

    clearSteps() {
        this.stepsList.innerHTML = '';
    }

    setOperationLabel(operation) {
        this.stepsOperationLabel.textContent = operation;
    }

    markStepComplete() {
        const steps = this.stepsList.querySelectorAll('.step');
        steps.forEach(step => {
            if (step.classList.contains('current')) {
                step.classList.remove('current');
                step.classList.add('done');
            } else if (step.classList.contains('pending')) {
                step.classList.remove('pending');
                step.classList.add('current');
                return false; // Stop at first pending step
            }
        });
    }

    updateCodePanel(operation, value = '') {
        const codeExamples = {
            insertAtHead: `// Insert at Head
function insertAtHead(data) {
    const newNode = new Node(${value});
    if (!this.head) {
        this.head = this.tail = newNode;
    } else {
        newNode.next = this.head;
        this.head.prev = newNode;
        this.head = newNode;
    }
    this.size++;
}`,
            insertAtTail: `// Insert at Tail  
function insertAtTail(data) {
    const newNode = new Node(${value});
    if (!this.tail) {
        this.head = this.tail = newNode;
    } else {
        this.tail.next = newNode;
        newNode.prev = this.tail;
        this.tail = newNode;
    }
    this.size++;
}`,
            insertAfter: `// Insert After Node
function insertAfter(targetNode, data) {
    const newNode = new Node(${value});
    newNode.next = targetNode.next;
    newNode.prev = targetNode;
    if (targetNode.next) {
        targetNode.next.prev = newNode;
    }
    targetNode.next = newNode;
    this.size++;
}`,
            insertBefore: `// Insert Before Node
function insertBefore(targetNode, data) {
    const newNode = new Node(${value});
    newNode.prev = targetNode.prev;
    newNode.next = targetNode;
    if (targetNode.prev) {
        targetNode.prev.next = newNode;
    }
    targetNode.prev = newNode;
    this.size++;
}`,
            delete: `// Delete Node
function delete(targetNode) {
    if (targetNode.prev) {
        targetNode.prev.next = targetNode.next;
    } else {
        this.head = targetNode.next;
    }
    
    if (targetNode.next) {
        targetNode.next.prev = targetNode.prev;
    } else {
        this.tail = targetNode.prev;
    }
    
    this.size--;
}`,
            reset: 'Doubly Linked List initialized. Add nodes using the buttons above!'
        };
        
        this.codePanel.textContent = codeExamples[operation] || codeExamples.reset;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DLLVisualizer();
});