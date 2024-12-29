class ConcentrationConverter extends Converter {
    constructor() {
        super('concentration-converter');
        // 所有转换率都基于质量百分比（% w/w）作为基准单位
        this.rates = {
            '% w/w': 1,            // 质量百分比（基准单位）
            'mol/L': 1 / 10,       // 摩尔浓度（假设密度为1 g/mL）
            'g/L': 10,             // 质量浓度
            'mg/L': 10000,         // 毫克每升
            'ppm': 10000,          // 百万分之一
            'ppb': 10000 / 1000    // 十亿分之一
        };

        this.decimals = {
            '% w/w': 6,
            'mol/L': 6,
            'g/L': 6,
            'mg/L': 6,
            'ppm': 6,
            'ppb': 6
        };
    }

    convert() {
        try {
            const value = parseFloat(this.fromInput.value);
            if (isNaN(value)) {
                this.toInput.value = '';
                return;
            }

            const fromUnit = this.fromSelect.value;
            const toUnit = this.toSelect.value;
            
            console.log(`Converting ${value} from ${fromUnit} to ${toUnit}`);

            // 计算基于质量百分比的值
            const baseValue = value * this.rates[fromUnit];
            const result = baseValue / this.rates[toUnit];

            const decimals = this.decimals[toUnit];
            this.toInput.value = result.toFixed(decimals);
            console.log(`Conversion result: ${this.toInput.value}`);
        } catch (error) {
            console.error('Conversion error:', error);
        }
    }

    reverseConvert() {
        try {
            const value = parseFloat(this.toInput.value);
            if (isNaN(value)) {
                this.fromInput.value = '';
                return;
            }

            const fromUnit = this.fromSelect.value;
            const toUnit = this.toSelect.value;

            console.log(`Reverse converting ${value} from ${toUnit} to ${fromUnit}`);

            // 计算基于质量百分比的值
            const baseValue = value * this.rates[toUnit];
            const result = baseValue / this.rates[fromUnit];

            const decimals = this.decimals[fromUnit];
            this.fromInput.value = result.toFixed(decimals);
            console.log(`Reverse conversion result: ${this.fromInput.value}`);
        } catch (error) {
            console.error('Reverse conversion error:', error);
        }
    }
} 