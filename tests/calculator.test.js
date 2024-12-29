describe('Calculator', () => {
    let calculator;
    
    beforeEach(() => {
        calculator = new Calculator();
    });
    
    test('basic arithmetic operations', () => {
        expect(calculator.add(2, 3)).toBe(5);
        expect(calculator.subtract(5, 3)).toBe(2);
        expect(calculator.multiply(4, 3)).toBe(12);
        expect(calculator.divide(6, 2)).toBe(3);
    });
    
    // 更多测试...
}); 