class Calculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.memory = 0;
        this.showMemory = false;
        this.shouldResetScreen = false;
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) {
            return;
        }
        
        const calculator = document.querySelector('#standard-calculator');
        if (!calculator) {
            console.error('Standard calculator not found');
            return;
        }
        
        this.currentOperandElement = calculator.querySelector('.current-operand');
        this.previousOperandElement = calculator.querySelector('.previous-operand');
        this.memoryDisplay = calculator.querySelector('.memory-display');
        
        if (!this.currentOperandElement || !this.previousOperandElement) {
            console.error('Required display elements not found');
            return;
        }
        
        const keypad = calculator.querySelector('.keypad');
        if (keypad) {
            keypad.addEventListener('click', (e) => {
                const button = e.target;
                if (button.tagName === 'BUTTON') {
                    if (button.classList.contains('number')) {
                        this.appendNumber(button.innerText);
                    } else if (button.classList.contains('operator')) {
                        this.chooseOperation(button.innerText);
                    } else if (button.classList.contains('function')) {
                        this.executeFunction(button.innerText);
                    } else if (button.classList.contains('equals')) {
                        this.compute();
                    } else if (button.classList.contains('clear')) {
                        this.clear();
                    }
                    this.updateDisplay();
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        this.updateDisplay();
        this.initialized = true;
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
    }
    
    chooseOperation(operation) {
        console.log('Choosing operation:', operation);
        console.log('Current state:', {
            current: this.currentOperand,
            previous: this.previousOperand,
            operation: this.operation
        });
        
        if (this.currentOperand === '') return;
        
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.shouldResetScreen = false;
    }
    
    compute() {
        console.log('Computing with:', {
            current: this.currentOperand,
            previous: this.previousOperand,
            operation: this.operation
        });
        
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand || '0');
        
        if (isNaN(prev)) {
            return;
        }
        
        if (isNaN(current)) {
            this.currentOperand = this.previousOperand;
            this.previousOperand = '';
            this.operation = undefined;
            return;
        }
        
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
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.operation = undefined;
                    this.previousOperand = '';
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        console.log('Computation result:', computation);
        
        if (Number.isFinite(computation)) {
            if (Number.isInteger(computation)) {
                this.currentOperand = computation.toString();
            } else {
                this.currentOperand = computation.toFixed(8).replace(/\.?0+$/, '');
            }
        } else {
            this.currentOperand = 'Error';
        }
        
        this.addToHistory(`${prev} ${this.operation} ${current} = ${this.currentOperand}`);
        
        this.operation = undefined;
        this.previousOperand = '';
        
        this.shouldResetScreen = true;
        
        console.log('New state:', {
            current: this.currentOperand,
            previous: this.previousOperand,
            operation: this.operation
        });
    }
    
    executeFunction(func) {
        console.log('Executing function:', func);
        let number = parseFloat(this.currentOperand);
        
        try {
            switch (func) {
                case '⌫':
                    this.currentOperand = this.currentOperand.toString().slice(0, -1);
                    if (this.currentOperand === '') this.currentOperand = '0';
                    return;
                    
                case 'CE':
                    this.currentOperand = '0';
                    return;
                    
                case 'C':
                    this.clear();
                    return;
                    
                case '%':
                    if (this.previousOperand) {
                        // 如果有前一个操作数，计算百分比
                        const base = parseFloat(this.previousOperand);
                        this.currentOperand = (base * number / 100).toString();
                    } else {
                        // 否则直接计算百分比
                        this.currentOperand = (number / 100).toString();
                    }
                    break;
                    
                case '±':
                    if (number !== 0) {
                        this.currentOperand = (-number).toString();
                    }
                    break;
                    
                case '1/x':
                    if (number === 0) {
                        throw new Error('除数不能为零');
                    }
                    this.currentOperand = (1 / number).toString();
                    break;
                    
                case 'x²':
                    this.currentOperand = (number * number).toString();
                    break;
                    
                case '√':
                    if (number < 0) {
                        throw new Error('负数不能开平方根');
                    }
                    this.currentOperand = Math.sqrt(number).toString();
                    break;
            }
            
            // 格式化结果
            if (this.currentOperand !== '0' && !isNaN(this.currentOperand)) {
                const num = parseFloat(this.currentOperand);
                if (Number.isInteger(num)) {
                    this.currentOperand = num.toString();
                } else {
                    this.currentOperand = num.toFixed(8).replace(/\.?0+$/, '');
                }
            }
            
            // 添加到历史记录
            if (func !== '⌫' && func !== 'CE' && func !== 'C') {
                this.addToHistory(`${func}(${number}) = ${this.currentOperand}`);
            }
            
        } catch (error) {
            console.error('计算错误:', error);
            this.currentOperand = 'Error';
        }
    }
    
    handleMemory(operation) {
        console.log('Memory operation:', operation);
        const current = parseFloat(this.currentOperand);
        
        try {
            switch (operation) {
                case 'MC':
                    this.memory = 0;
                    this.showMemory = false;
                    break;
                    
                case 'MR':
                    if (this.memory !== undefined) {
                        this.currentOperand = this.memory.toString();
                        this.shouldResetScreen = true;
                    }
                    break;
                    
                case 'M+':
                    if (isNaN(current)) return;
                    this.memory = (this.memory || 0) + current;
                    this.showMemory = true;
                    this.shouldResetScreen = true;
                    break;
                    
                case 'M-':
                    if (isNaN(current)) return;
                    this.memory = (this.memory || 0) - current;
                    this.showMemory = true;
                    this.shouldResetScreen = true;
                    break;
                    
                case 'MS':
                    if (isNaN(current)) return;
                    this.memory = current;
                    this.showMemory = true;
                    this.shouldResetScreen = true;
                    break;
            }
            
            // 更新内存显示
            if (this.memoryDisplay) {
                this.memoryDisplay.style.visibility = this.showMemory ? 'visible' : 'hidden';
            }
            
            // 添加到历史记录
            this.addToHistory(`${operation}: ${current}`);
            
        } catch (error) {
            console.error('Memory operation error:', error);
        }
    }
    
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }
    
    updateDisplay() {
        console.log('Updating display:', {
            current: this.currentOperand,
            previous: this.previousOperand,
            operation: this.operation
        });
        
        this.currentOperandElement.innerText = this.currentOperand;
        if (this.operation != null) {
            this.previousOperandElement.innerText = 
                `${this.previousOperand} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }
    
    handleKeyboard(e) {
        console.log('Key pressed:', e.key);
        
        // 防止按键事件影响其他输入框
        if (e.target.tagName === 'INPUT') return;
        
        // 数字和小数点
        if (/^[0-9.]$/.test(e.key)) {
            e.preventDefault();
            this.appendNumber(e.key);
        }
        
        // 运算符
        if (['+', '-', '*', '/', 'x', '×', '÷'].includes(e.key)) {
            e.preventDefault();
            let op = e.key;
            if (op === '*' || op === 'x') op = '×';
            if (op === '/') op = '÷';
            this.chooseOperation(op);
        }
        
        // 等号和回车
        if (e.key === '=' || e.key === 'Enter') {
            e.preventDefault();
            this.compute();
        }
        
        // 退格键
        if (e.key === 'Backspace') {
            e.preventDefault();
            this.executeFunction('⌫');
        }
        
        // Escape键清除
        if (e.key === 'Escape') {
            e.preventDefault();
            this.clear();
        }
        
        // 百分号
        if (e.key === '%') {
            e.preventDefault();
            this.executeFunction('%');
        }
        
        this.updateDisplay();
    }
    
    addToHistory(entry) {
        const historyContent = document.querySelector('.history-content');
        if (!historyContent) {
            console.warn('History container not found, skipping history entry');
            return;
        }
        
        try {
            const div = document.createElement('div');
            div.textContent = entry;
            div.style.padding = '5px 0';
            div.style.borderBottom = '1px solid #eee';
            historyContent.insertBefore(div, historyContent.firstChild);
        } catch (error) {
            console.error('Error adding history entry:', error);
        }
    }

    // 添加统计计算功能
    addStatisticalFunctions() {
        this.statisticalFunctions = {
            'mean': (arr) => arr.reduce((a,b) => a + b) / arr.length,
            'median': (arr) => {
                arr.sort((a,b) => a - b);
                return arr.length % 2 ? 
                    arr[Math.floor(arr.length/2)] : 
                    (arr[arr.length/2-1] + arr[arr.length/2]) / 2;
            },
            'stdDev': (arr) => {
                const mean = this.statisticalFunctions.mean(arr);
                return Math.sqrt(arr.reduce((a,b) => a + Math.pow(b-mean,2), 0) / arr.length);
            }
        };
    }

    // 添加方程求解功能
    addEquationSolver() {
        // 线性方程组求解
        // 二次方程求解
        // 等等
    }

    // 改进错误处理
    executeOperation(operation) {
        try {
            if (!this.isValidOperation(operation)) {
                throw new Error('Invalid operation');
            }
            // 执行操作...
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    // 添加输入验证
    validateInput(input) {
        if (typeof input !== 'string' && typeof input !== 'number') {
            throw new TypeError('Invalid input type');
        }
        // 更多验证...
    }
}

class ScientificCalculator extends Calculator {
    constructor() {
        super();
        this.isRadians = false;
        this.is2ndFunc = false;
        this.waitingForSecondOperand = false;
    }
    
    init() {
        if (this.initialized) {
            return;
        }
        
        const calculator = document.querySelector('#scientific-calculator');
        if (!calculator) {
            console.error('Scientific calculator not found');
            return;
        }
        
        this.currentOperandElement = calculator.querySelector('.current-operand');
        this.previousOperandElement = calculator.querySelector('.previous-operand');
        this.memoryDisplay = calculator.querySelector('.memory-display');
        this.angleMode = calculator.querySelector('.angle-mode');
        
        if (!this.currentOperandElement || !this.previousOperandElement) {
            console.error('Required display elements not found');
            return;
        }
        
        const keypad = calculator.querySelector('.scientific-keypad');
        if (keypad) {
            keypad.addEventListener('click', (e) => {
                const button = e.target;
                if (button.tagName === 'BUTTON') {
                    console.log('Button clicked:', button.innerText, button.classList);
                    
                    if (button.classList.contains('number')) {
                        this.appendNumber(button.innerText);
                    } else if (button.classList.contains('operator')) {
                        // 特殊处理xy运算
                        if (button.innerText === 'xʸ') {
                            this.handleExponent();
                        } else {
                            this.chooseOperation(button.innerText);
                        }
                    } else if (button.classList.contains('function')) {
                        if (button.innerText === 'xʸ') {
                            this.handleExponent();
                        } else {
                            this.executeScientificFunction(button.innerText);
                        }
                    } else if (button.classList.contains('equals')) {
                        this.compute();
                    } else if (button.classList.contains('clear')) {
                        this.clear();
                    }
                    
                    this.updateDisplay();
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        this.updateDisplay();
        this.initialized = true;
    }
    
    handleExponent() {
        console.log('Handling exponent operation');
        if (this.currentOperand === '') return;
        
        this.operation = 'xʸ';
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.waitingForSecondOperand = true;
        this.updateDisplay();
    }
    
    compute() {
        console.log('Computing with:', {
            operation: this.operation,
            previous: this.previousOperand,
            current: this.currentOperand
        });
        
        if (this.operation === 'xʸ') {
            const base = parseFloat(this.previousOperand);
            const exponent = parseFloat(this.currentOperand);
            
            try {
                if (isNaN(base) || isNaN(exponent)) {
                    throw new Error('无效的操作数');
                }
                
                if (base === 0 && exponent <= 0) {
                    throw new Error('0的非正指数未定义');
                }
                
                const result = Math.pow(base, exponent);
                if (!Number.isFinite(result)) {
                    throw new Error('计算结果超出范围');
                }
                
                this.currentOperand = result.toString();
                this.addToHistory(`${base}^${exponent} = ${result}`);
            } catch (error) {
                console.error('指数运算错误:', error);
                this.currentOperand = 'Error';
            }
            
            this.operation = undefined;
            this.previousOperand = '';
            this.waitingForSecondOperand = false;
        } else {
            super.compute();
        }
    }
    
    updateDisplay() {
        this.currentOperandElement.innerText = this.currentOperand;
        
        if (this.operation) {
            let displayOperation = this.operation;
            if (this.operation === 'xʸ') {
                displayOperation = '^';
            }
            this.previousOperandElement.innerText = `${this.previousOperand} ${displayOperation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }
    
    executeScientificFunction(func) {
        console.log('Executing scientific function:', func);
        let number = parseFloat(this.currentOperand);
        
        try {
            let result;
            
            // 检查输入是否有效
            if (isNaN(number) && !['π', 'e'].includes(func)) {
                throw new Error('无效的输入');
            }
            
            switch (func) {
                // 三角函数
                case 'sin':
                    result = this.is2ndFunc ? 
                        Math.asin(number) : 
                        (this.isRadians ? Math.sin(number) : Math.sin(number * Math.PI / 180));
                    break;
                case 'cos':
                    result = this.is2ndFunc ? 
                        Math.acos(number) : 
                        (this.isRadians ? Math.cos(number) : Math.cos(number * Math.PI / 180));
                    break;
                case 'tan':
                    result = this.is2ndFunc ? 
                        Math.atan(number) : 
                        (this.isRadians ? Math.tan(number) : Math.tan(number * Math.PI / 180));
                    break;
                
                // 双曲函数
                case 'sinh':
                    result = Math.sinh(number);
                    break;
                case 'cosh':
                    result = Math.cosh(number);
                    break;
                case 'tanh':
                    result = Math.tanh(number);
                    break;
                
                // 常数
                case 'π':
                    result = Math.PI;
                    break;
                case 'e':
                    result = Math.E;
                    break;
                
                // 指数和对数
                case 'x²':
                    result = Math.pow(number, 2);
                    break;
                case '√':
                    if (number < 0) throw new Error('负数不能开平方根');
                    result = Math.sqrt(number);
                    break;
                case '10ˣ':
                    result = Math.pow(10, number);
                    break;
                case 'log':
                    if (number <= 0) throw new Error('对数的底数必须为正数');
                    result = Math.log10(number);
                    break;
                case 'ln':
                    if (number <= 0) throw new Error('对数的真数必须为正数');
                    result = Math.log(number);
                    break;
                
                // 其他函数
                case '1/x':
                    if (number === 0) throw new Error('除数不能为零');
                    result = 1 / number;
                    break;
                case '|x|':
                    result = Math.abs(number);
                    break;
                case 'n!':
                    if (number < 0 || !Number.isInteger(number)) 
                        throw new Error('阶乘只适用于非负整数');
                    if (number > 170) throw new Error('数字太大');
                    result = this.factorial(number);
                    break;
                case '2ⁿᵈ':
                    this.is2ndFunc = !this.is2ndFunc;
                    this.updateFunctionButtons();
                    return;
                case 'DEG':
                case 'RAD':
                    this.toggleAngleMode();
                    return;
            }
            
            if (result !== undefined) {
                if (!Number.isFinite(result)) {
                    throw new Error('计算结果超出范围');
                }
                
                // 格式化结果
                if (Number.isInteger(result)) {
                    this.currentOperand = result.toString();
                } else {
                    this.currentOperand = result.toFixed(8).replace(/\.?0+$/, '');
                }
                
                // 添加到历史记录
                this.addToHistory(`${func}(${number}) = ${this.currentOperand}`);
            }
            
        } catch (error) {
            console.error('计算错误:', error);
            this.currentOperand = 'Error';
        }
        
        this.updateDisplay();
    }
    
    factorial(n) {
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    toggleAngleMode() {
        this.isRadians = !this.isRadians;
        const modeButton = document.querySelector('#scientific-calculator .toggle');
        if (modeButton) {
            modeButton.innerText = this.isRadians ? 'RAD' : 'DEG';
        }
    }
    
    updateFunctionButtons() {
        const buttons = document.querySelectorAll('#scientific-calculator .function');
        buttons.forEach(button => {
            if (button.dataset.second) {
                button.innerText = this.is2ndFunc ? button.dataset.second : button.dataset.first;
            }
        });
        
        const secondButton = document.querySelector('#scientific-calculator .function[data-function="2nd"]');
        if (secondButton) {
            secondButton.classList.toggle('active', this.is2ndFunc);
        }
    }
}

class ProgrammerCalculator extends Calculator {
    constructor() {
        super();
        this.base = 16;          // 当前进制
        this.wordSize = 32;      // 当前字长
        this.initialized = false;
    }

    // 初始化函数
    init() {
        if (this.initialized) return;

        const calculator = document.querySelector('#programmer-calculator');
        if (!calculator) {
            console.error('Programmer calculator not found');
            return;
        }

        // 获取显示元素
        this.display = calculator.querySelector('.current-operand');
        this.previousDisplay = calculator.querySelector('.previous-operand');
        this.hexDisplay = calculator.querySelector('.hex-display');
        this.decDisplay = calculator.querySelector('.dec-display');
        this.octDisplay = calculator.querySelector('.oct-display');
        this.binDisplay = calculator.querySelector('.bin-display');

        // 添加进制转换按钮事件
        const baseButtons = calculator.querySelectorAll('.base-button');
        baseButtons.forEach(button => {
            button.addEventListener('click', () => {
                const base = {
                    'HEX': 16,
                    'DEC': 10,
                    'OCT': 8,
                    'BIN': 2
                }[button.textContent];
                if (base) {
                    this.changeBase(base);
                    baseButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                }
            });
        });

        // 添加字长切换按钮事件
        const wordSizeButtons = calculator.querySelectorAll('.word-size-button');
        wordSizeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const size = {
                    'QWORD': 64,
                    'DWORD': 32,
                    'WORD': 16,
                    'BYTE': 8
                }[button.textContent];
                if (size) {
                    this.wordSize = size;
                    wordSizeButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    this.updateDisplay();
                }
            });
        });

        // 添加按钮事件监听
        const keypad = calculator.querySelector('.programmer-keypad');
        if (keypad) {
            keypad.addEventListener('click', (e) => {
                const button = e.target;
                if (!button.matches('button')) return;

                if (button.classList.contains('number') || button.classList.contains('hex')) {
                    this.appendNumber(button.textContent);
                } else if (button.classList.contains('operator')) {
                    this.chooseOperation(button.textContent);
                } else if (button.classList.contains('function')) {
                    this.executeFunction(button.textContent);
                } else if (button.classList.contains('equals')) {
                    this.compute();
                } else if (button.classList.contains('clear')) {
                    button.textContent === 'CE' ? this.clearEntry() : this.clear();
                }
            });
        } else {
            console.error('Keypad not found');
        }

        this.updateDisplay();
        this.initialized = true;
    }

    // 数字输入处理
    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }

        // 验证输入是否符合当前进制
        const validChars = {
            2: /^[01]$/,
            8: /^[0-7]$/,
            10: /^[0-9]$/,
            16: /^[0-9A-Fa-f]$/
        };

        if (!validChars[this.base].test(number)) {
            return; // 如果输入不符合当前进制，直接回
        }

        if (this.currentOperand === '0') {
            this.currentOperand = number.toUpperCase();
        } else {
            this.currentOperand += number.toUpperCase();
        }
        this.updateDisplay();
    }

    // 位运算处理
    executeBitwiseOperation(operation, value1, value2 = null) {
        // 确保操作数有效
        const num1 = BigInt(parseInt(value1, this.base));
        const num2 = value2 ? BigInt(parseInt(value2, this.base)) : null;
        const mask = (1n << BigInt(this.wordSize)) - 1n;
        let result;
        
        switch (operation) {
            case 'AND':
            case '按位与':
                result = num1 & num2;
                break;
            case 'OR':
            case '按位或':
                result = num1 | num2;
                break;
            case 'XOR':
            case '按位异或':
                result = num1 ^ num2;
                break;
            case 'NOT':
            case '按位取反':
                result = ~num1 & mask;
                break;
            case '左移':
                result = (num1 << num2) & mask;
                break;
            case '右移':
                result = num1 >> num2;
                break;
            default:
                return null;
        }
        
        result = result & mask; // 确保结果在当前字长范围内
        return result.toString(this.base).toUpperCase();
    }

    // 更新显示方法
    updateDisplay() {
        // 更新当前操作数显示
        if (this.display) {
            this.display.textContent = this.currentOperand;
        }
        
        // 更新前一个操作数显示
        if (this.previousDisplay) {
            if (this.operation) {
                this.previousDisplay.textContent = `${this.previousOperand} ${this.operation}`;
            } else {
                this.previousDisplay.textContent = '';
            }
        }

        // 更新各进制显示
        const decValue = parseInt(this.currentOperand || '0', this.base);
        
        if (this.hexDisplay) {
            this.hexDisplay.textContent = `HEX ${decValue.toString(16).toUpperCase()}`;
        }
        if (this.decDisplay) {
            this.decDisplay.textContent = `DEC ${decValue.toString(10)}`;
        }
        if (this.octDisplay) {
            this.octDisplay.textContent = `OCT ${decValue.toString(8)}`;
        }
        if (this.binDisplay) {
            this.binDisplay.textContent = `BIN ${decValue.toString(2)}`;
        }
    }

    // 进制转换方法
    changeBase(newBase) {
        if (this.currentOperand && this.currentOperand !== '0') {
            // 先转换为十进制，再转换为目标进制
            const decValue = parseInt(this.currentOperand, this.base);
            this.currentOperand = decValue.toString(newBase).toUpperCase();
        }
        this.base = newBase;
        this.updateDisplay();
    }

    // 清除当前输入
    clearEntry() {
        this.currentOperand = '0';
        this.updateDisplay();
    }

    // 执行功能按钮操作
    executeFunction(func) {
        console.log('Executing function:', func);
        
        const normalizedFunc = this.normalizeOperator(func);
        console.log('Normalized function:', normalizedFunc);

        try {
            switch (normalizedFunc) {
                case 'LSH':
                case 'RSH':
                    console.log('Shift operation detected:', normalizedFunc);
                    this.chooseOperation(normalizedFunc);
                    break;
                case 'NOT':
                    if (this.currentOperand !== '0') {
                        const value = parseInt(this.currentOperand, this.base);
                        const mask = (1n << BigInt(this.wordSize)) - 1n;
                        const result = (~BigInt(value)) & mask;
                        this.currentOperand = result.toString(this.base).toUpperCase();
                    }
                    break;
                case 'AND':
                    this.chooseOperation('AND');
                    break;
                case 'OR':
                    this.chooseOperation('OR');
                    break;
                case 'XOR':
                    this.chooseOperation('XOR');
                    break;
                case 'ROL':
                    if (this.currentOperand !== '0') {
                        try {
                            const value = parseInt(this.currentOperand, this.base);
                            if (!isNaN(value)) {
                                const result = this.rotateLeft(value, 1);
                                this.currentOperand = result.toString(this.base).toUpperCase();
                            }
                        } catch (error) {
                            console.error('Error in ROL operation:', error);
                            this.currentOperand = 'Error';
                        }
                    }
                    break;
                case 'ROR':
                    if (this.currentOperand !== '0') {
                        try {
                            const value = parseInt(this.currentOperand, this.base);
                            if (!isNaN(value)) {
                                const result = this.rotateRight(value, 1);
                                this.currentOperand = result.toString(this.base).toUpperCase();
                            }
                        } catch (error) {
                            console.error('Error in ROR operation:', error);
                            this.currentOperand = 'Error';
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error('Error in executeFunction:', error);
            this.currentOperand = 'Error';
        }
        
        this.updateDisplay();
    }

    // 添加标准化操作符方法
    normalizeOperator(func) {
        const operatorMap = {
            '~': 'NOT',
            '按位取反': 'NOT',
            '&': 'AND',
            '按位与': 'AND',
            '|': 'OR',
            '按位或': 'OR',
            '^': 'XOR',
            '按位异或': 'XOR',
            '<<': 'LSH',
            'LSH': 'LSH',
            '>>': 'RSH',
            'RSH': 'RSH'
        };
        return operatorMap[func] || func;
    }

    // 修改循环左移方法
    rotateLeft(value, shift) {
        try {
            // 确保输入值是有效的
            if (isNaN(value) || isNaN(shift)) {
                console.error('Invalid input for rotateLeft:', { value, shift });
                return 0;
            }

            const wordSize = BigInt(this.wordSize);
            const mask = (1n << wordSize) - 1n;
            let bigValue = BigInt(Math.floor(value)) & mask; // 确保值在有效范围内
            const bigShift = BigInt(Math.floor(shift)) % wordSize;

            // 执行循环左移
            const leftPart = (bigValue << bigShift) & mask;
            const rightPart = (bigValue >> (wordSize - bigShift)) & mask;
            const result = leftPart | rightPart;

            return Number(result);
        } catch (error) {
            console.error('Error in rotateLeft:', error);
            return 0;
        }
    }

    // 修改循环右移方法
    rotateRight(value, shift) {
        try {
            // 确保输入值是有效的
            if (isNaN(value) || isNaN(shift)) {
                console.error('Invalid input for rotateRight:', { value, shift });
                return 0;
            }

            const wordSize = BigInt(this.wordSize);
            const mask = (1n << wordSize) - 1n;
            let bigValue = BigInt(Math.floor(value)) & mask; // 确保值在有效范围内
            const bigShift = BigInt(Math.floor(shift)) % wordSize;

            // 执行循环右移
            const rightPart = (bigValue >> bigShift) & mask;
            const leftPart = (bigValue << (wordSize - bigShift)) & mask;
            const result = leftPart | rightPart;

            return Number(result);
        } catch (error) {
            console.error('Error in rotateRight:', error);
            return 0;
        }
    }

    // 计算结果
    compute() {
        if (!this.operation || !this.previousOperand) return;

        try {
            const prev = parseInt(this.previousOperand, this.base);
            const current = parseInt(this.currentOperand || '0', this.base);
            
            if (isNaN(prev) || isNaN(current)) {
                throw new Error('Invalid operands');
            }

            console.log('Computing:', {
                operation: this.operation,
                prev,
                current,
                base: this.base,
                wordSize: this.wordSize
            });

            const mask = (1n << BigInt(this.wordSize)) - 1n;
            let result;

            switch (this.operation) {
                case 'LSH':
                    if (current >= 0 && current < this.wordSize) {
                        const bigPrev = BigInt(prev);
                        const bigCurrent = BigInt(current);
                        result = (bigPrev << bigCurrent) & mask;
                        console.log('LSH result:', result.toString());
                    } else {
                        throw new Error('Invalid shift amount');
                    }
                    break;
                case 'RSH':
                    if (current >= 0 && current < this.wordSize) {
                        const bigPrev = BigInt(prev);
                        const bigCurrent = BigInt(current);
                        result = (bigPrev >> bigCurrent) & mask;
                        console.log('RSH result:', result.toString());
                    } else {
                        throw new Error('Invalid shift amount');
                    }
                    break;
                case 'AND':
                    result = BigInt(prev) & BigInt(current);
                    break;
                case 'OR':
                    result = BigInt(prev) | BigInt(current);
                    break;
                case 'XOR':
                    result = BigInt(prev) ^ BigInt(current);
                    break;
                default:
                    return super.compute();
            }

            if (result !== undefined) {
                this.currentOperand = result.toString(this.base).toUpperCase();
                this.operation = undefined;
                this.previousOperand = '';
                console.log('Final result:', this.currentOperand);
            }
        } catch (error) {
            console.error('Computation error:', error);
            this.currentOperand = 'Error';
            this.operation = undefined;
            this.previousOperand = '';
        }
        
        this.updateDisplay();
    }

    // 选择操作
    chooseOperation(operation) {
        console.log('Choosing operation:', operation);
        
        if (this.currentOperand === '') return;
        
        // 如果已经有一个操作数和操作符，先计算之前的结果
        if (this.previousOperand !== '') {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.updateDisplay();
    }
}

class DateCalculator {
    constructor() {
        this.init();
    }
    
    init() {
        this.fromDate = document.getElementById('fromDate');
        this.toDate = document.getElementById('toDate');
        this.baseDate = document.getElementById('baseDate');
        this.daysCount = document.getElementById('daysCount');
        this.dateDifference = document.getElementById('dateDifference');
        this.dateCalculation = document.getElementById('dateCalculation');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.fromDate.addEventListener('change', () => this.calculateDifference());
        this.toDate.addEventListener('change', () => this.calculateDifference());
        this.baseDate.addEventListener('change', () => this.calculateNewDate());
        this.daysCount.addEventListener('input', () => this.calculateNewDate());
        
        document.getElementById('addDays').addEventListener('click', () => {
            this.daysCount.value = Math.abs(parseInt(this.daysCount.value || 0));
            this.calculateNewDate();
        });
        
        document.getElementById('subtractDays').addEventListener('click', () => {
            this.daysCount.value = -Math.abs(parseInt(this.daysCount.value || 0));
            this.calculateNewDate();
        });
    }
    
    calculateDifference() {
        if (this.fromDate.value && this.toDate.value) {
            const date1 = new Date(this.fromDate.value);
            const date2 = new Date(this.toDate.value);
            const diffTime = Math.abs(date2 - date1);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            this.dateDifference.textContent = `相差 ${diffDays} 天`;
        }
    }
    
    calculateNewDate() {
        if (this.baseDate.value && this.daysCount.value) {
            const date = new Date(this.baseDate.value);
            const days = parseInt(this.daysCount.value);
            date.setDate(date.getDate() + days);
            this.dateCalculation.textContent = date.toLocaleDateString('zh-CN');
        }
    }
}

class CalculatorManager {
    constructor() {
        this.currentMode = 'standard';
        this.calculators = {
            'standard': new Calculator(),
            'scientific': new ScientificCalculator(),
            'programmer': new ProgrammerCalculator(),
            'date': new DateCalculator()
        };
        this.converters = {};  // 将在 init 中初始化
    }
    
    init() {
        console.log('Initializing CalculatorManager');
        this.initConverters();
        this.setupEventListeners();
        this.switchMode('standard');
    }

    setupEventListeners() {
        // 添加导航事件监听
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = item.getAttribute('data-mode');
                console.log('Clicked mode:', mode);
                this.switchMode(mode);
            });
        });

        // 添加键盘事件监听，只对计算器有效
        document.addEventListener('keydown', (e) => {
            const currentTool = this.calculators[this.currentMode];
            if (currentTool && typeof currentTool.handleKeyboard === 'function') {
                currentTool.handleKeyboard(e);
            }
        });
    }

    initConverters() {
        console.log('Initializing converters');
        this.converters = {
            'currency-converter': new CurrencyConverter(),
            'length-converter': new LengthConverter(),
            'volume-converter': new VolumeConverter(),
            'weight-converter': new WeightConverter(),
            'temperature-converter': new TemperatureConverter(),
            'area-converter': new AreaConverter(),
            'speed-converter': new SpeedConverter(),
            'time-converter': new TimeConverter(),
            'energy-converter': new EnergyConverter(),
            'power-converter': new PowerConverter(),
            'data-converter': new DataConverter(),
            'pressure-converter': new PressureConverter(),
            'angle-converter': new AngleConverter(),
            'concentration-converter': new ConcentrationConverter()  // 添加浓度转换器
        };

        Object.entries(this.converters).forEach(([key, converter]) => {
            console.log(`Initializing converter: ${key}`);
            converter.init();
        });
    }

    switchMode(mode) {
        console.log('Switching to mode:', mode);
        
        // 隐藏所有计算器和转换器
        document.querySelectorAll('.calculator-mode, .converter-mode').forEach(calc => {
            calc.style.display = 'none';
            calc.classList.remove('active');
        });
        
        // 获取目标元素
        let targetElement;
        
        // 尝试不同的 ID 组合
        const possibleIds = [
            mode,                           // 原始模式名
            `${mode}-calculator`,          // 带 calculator 后缀
            `${mode}-converter`,           // 带 converter 后缀
            mode.replace('-converter', ''), // 移除 converter 后缀
            mode.replace('-calculator', '') // 移除 calculator 后缀
        ];

        // 尝试找到匹配的元素
        for (const id of possibleIds) {
            const element = document.getElementById(id);
            if (element) {
                targetElement = element;
                console.log(`Found element with ID: ${id}`);
                break;
            }
        }
        
        if (targetElement) {
            // 显示目标元素
            targetElement.style.display = 'block';
            targetElement.classList.add('active');
            
            // 初始化对应的工具
            const baseMode = mode.replace('-calculator', '').replace('-converter', '');
            if (this.calculators[baseMode]) {
                console.log(`Initializing calculator: ${baseMode}`);
                this.calculators[baseMode].init();
            } else if (this.converters[mode]) {
                console.log(`Initializing converter: ${mode}`);
                this.converters[mode].init();
            }
        } else {
            console.error('Target element not found for mode:', mode);
            console.log('Tried IDs:', possibleIds);
            return;
        }
        
        // 更新导航栏状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-mode') === mode) {
                item.classList.add('active');
            }
        });
        
        this.currentMode = mode;
    }

    // 添加数据导出功能
    exportData() {
        const data = {
            history: this.history,
            presets: this.presets,
            settings: this.settings
        };
        return JSON.stringify(data);
    }

    // 添加数据导入功能
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.validateImportData(data);
            Object.assign(this, data);
        } catch (error) {
            console.error('Import failed:', error);
        }
    }

    // 添加多语言支持
    setLanguage(lang) {
        this.currentLang = lang;
        this.updateUIText();
    }
}

// 在页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.calculatorManager = new CalculatorManager();
        window.calculatorManager.init();
        console.log('Calculator manager initialized');
    } catch (error) {
        console.error('Error initializing calculator manager:', error);
    }
});

// 添加移动端导航控制
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('overlay');

    // 汉堡菜单点击事件
    menuToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);

    // 添加触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        const threshold = 100;

        if (Math.abs(swipeDistance) < threshold) return;

        if (swipeDistance > 0 && touchStartX < 30) {
            // 从左向右滑动，打开侧边栏
            openSidebar();
        } else if (swipeDistance < 0 && sidebar.classList.contains('active')) {
            // 从右向左滑动，关闭侧边栏
            closeSidebar();
        }
    }

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.classList.toggle('sidebar-active'); // 添加body类
        
        // 如果侧边栏打开,滚动到顶部
        if (sidebar.classList.contains('active')) {
            sidebar.scrollTop = 0;
        }
    }

    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('sidebar-active');
        sidebar.scrollTop = 0;
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('sidebar-active');
    }

    // 防止侧边栏滚动传递到body
    sidebar.addEventListener('touchmove', (e) => {
        e.stopPropagation();
    }, { passive: true });

    // 处理iOS橡皮筋效果
    document.addEventListener('touchmove', (e) => {
        if (document.body.classList.contains('sidebar-active')) {
            e.preventDefault();
        }
    }, { passive: false });
}); 