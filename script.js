class Calculator {
    constructor(historyElement, displayElement) {
        this.historyElement = historyElement;
        this.displayElement = displayElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
        this.updateDisplay();
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                computation = prev / current;
                break;
            case '%':
                computation = (prev / 100) * current; // Standard calculator percent behavior often varies, but this is a common one
                // Actually, many simple calculators treat % as "divide current by 100" if no prev, or modulo.
                // Let's handle generic % as "divide by 100" for single operand, or logic above for two.
                // For simplicity in this logic: if operation is set, do the math.
                // But wait, standard behavior:
                // 50 + 10% -> 55. 
                // Simple logic might be safer: just divide by 100 immediately?
                break;
            default:
                return;
        }

        // Handle floating point errors roughly
        this.currentOperand = Math.round(computation * 100000000) / 100000000;
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true; // Ready for new number or next op
        this.updateDisplay();
    }

    // Special handling for the % button behaving as an immediate action
    applyPercent() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = current / 100;
        this.updateDisplay();
    }

    updateDisplay() {
        this.displayElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.historyElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.historyElement.innerText = '';
        }
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }
}

const historyElement = document.getElementById('history');
const displayElement = document.getElementById('display');
const calculator = new Calculator(historyElement, displayElement);

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        if (button.classList.contains('num')) {
            calculator.appendNumber(button.dataset.val);
        } else if (button.dataset.action === 'clear') {
            calculator.clear();
        } else if (button.dataset.action === 'delete') {
            calculator.delete();
        } else if (button.dataset.action === 'percent') {
            calculator.applyPercent();
        } else if (button.classList.contains('op')) {
            calculator.chooseOperation(button.innerText); // using innerText for visual matching
        } else if (button.dataset.action === 'calculate') {
            calculator.compute();
        }
    });
});

// Basic Keyboard support
document.addEventListener('keydown', (e) => {
    if ((e.key >= 0 && e.key <= 9) || e.key === '.') {
        calculator.appendNumber(e.key);
    }
    if (e.key === 'Enter' || e.key === '=') calculator.compute();
    if (e.key === 'Backspace') calculator.delete();
    if (e.key === 'Escape') calculator.clear();
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        let op = e.key;
        if (op === '*') op = '×';
        if (op === '/') op = '÷';
        calculator.chooseOperation(op);
    }
});
