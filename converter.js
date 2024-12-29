class Converter {
    constructor(type) {
        this.type = type;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return true;

        try {
            console.log(`Initializing ${this.type}`);
            
            // 获取容器
            this.container = document.getElementById(this.type);
            if (!this.container) {
                console.error(`Container not found for ${this.type}`);
                return false;
            }

            // 获取输入元素
            this.fromInput = this.container.querySelector('.converter-input-container:first-child .converter-input');
            this.toInput = this.container.querySelector('.converter-input-container:last-child .converter-input');
            this.fromSelect = this.container.querySelector('.converter-input-container:first-child .converter-select');
            this.toSelect = this.container.querySelector('.converter-input-container:last-child .converter-select');

            if (!this.fromInput || !this.toInput || !this.fromSelect || !this.toSelect) {
                console.error(`Required elements not found for ${this.type}`);
                return false;
            }

            // 移除只读属性
            this.toInput.removeAttribute('readonly');

            // 设置事件监听器
            this.setupEventListeners();
            
            this.initialized = true;
            console.log(`${this.type} initialized successfully`);
            return true;
        } catch (error) {
            console.error(`Error initializing ${this.type}:`, error);
            return false;
        }
    }

    setupEventListeners() {
        // 输入事件监听
        this.fromInput.addEventListener('input', () => {
            console.log(`${this.type} from input:`, this.fromInput.value);
            this.convert();
        });

        this.toInput.addEventListener('input', () => {
            console.log(`${this.type} to input:`, this.toInput.value);
            this.reverseConvert();
        });

        // 选择事件监听
        this.fromSelect.addEventListener('change', () => {
            console.log(`${this.type} from unit changed:`, this.fromSelect.value);
            this.convert();
        });

        this.toSelect.addEventListener('change', () => {
            console.log(`${this.type} to unit changed:`, this.toSelect.value);
            this.convert();
        });
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

            let result;
            if (this instanceof TemperatureConverter) {
                result = this.temperatureConvert(value, fromUnit, toUnit);
            } else {
                result = value * this.rates[fromUnit] / this.rates[toUnit];
            }

            this.toInput.value = Number(result).toFixed(6);
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

            let result;
            if (this instanceof TemperatureConverter) {
                result = this.temperatureConvert(value, toUnit, fromUnit);
            } else {
                result = value * this.rates[fromUnit] / this.rates[toUnit];
            }

            this.fromInput.value = Number(result).toFixed(6);
            console.log(`Reverse conversion result: ${this.fromInput.value}`);
        } catch (error) {
            console.error('Reverse conversion error:', error);
        }
    }

    // 添加批量转换功能
    batchConvert(values, fromUnit, toUnit) {
        return values.map(value => {
            const baseValue = value * this.rates[fromUnit];
            return (baseValue / this.rates[toUnit]).toFixed(this.decimals[toUnit]);
        });
    }

    // 添加自定义单位支持
    addCustomUnit(name, rate, decimals = 6) {
        this.rates[name] = rate;
        this.decimals[name] = decimals;
        this.updateUnitSelectors();
    }

    // 添加常用组合保存功能
    savePreset(name, fromUnit, toUnit) {
        this.presets = this.presets || {};
        this.presets[name] = { fromUnit, toUnit };
    }
}

class CurrencyConverter extends Converter {
    constructor() {
        super('currency-converter');
        // 修正汇率数据
        this.rates = {
            CNY: 1,
            USD: 0.14,
            EUR: 0.13,
            GBP: 0.11,
            JPY: 15.5
        };
    }

    async init() {
        const result = await super.init();
        if (result) {
            await this.updateRates();
        }
        return result;
    }

    async updateRates() {
        try {
            // 这里可以添加实际的汇率API调用
            // const response = await fetch('https://api.exchangerate-api.com/v4/latest/CNY');
            // const data = await response.json();
            // this.rates = data.rates;
            this.updateLastUpdate();
        } catch (error) {
            console.error('Error updating currency rates:', error);
        }
    }

    convert() {
        const value = parseFloat(this.fromInput.value);
        if (isNaN(value)) {
            this.toInput.value = '';
            return;
        }

        const fromCurrency = this.fromSelect.value;
        const toCurrency = this.toSelect.value;
        const result = value * this.rates[toCurrency] / this.rates[fromCurrency];
        this.toInput.value = result.toFixed(4);

        // 更新汇率显示
        const rate = this.rates[toCurrency] / this.rates[fromCurrency];
        this.updateRateDisplay(fromCurrency, toCurrency, rate);
    }

    reverseConvert() {
        const value = parseFloat(this.toInput.value);
        if (isNaN(value)) {
            this.fromInput.value = '';
            return;
        }

        const fromCurrency = this.fromSelect.value;
        const toCurrency = this.toSelect.value;
        const result = value * this.rates[fromCurrency] / this.rates[toCurrency];
        this.fromInput.value = result.toFixed(4);

        // 更新汇率显示
        const rate = this.rates[toCurrency] / this.rates[fromCurrency];
        this.updateRateDisplay(fromCurrency, toCurrency, rate);
    }

    updateRateDisplay(from, to, rate) {
        const infoElement = this.container.querySelector('.converter-info p');
        if (infoElement) {
            infoElement.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
        }
    }

    updateLastUpdate() {
        const timeElement = this.container.querySelector('.update-time');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = `上次更新时间：${now.toLocaleString('zh-CN')}`;
        }
    }
}

class LengthConverter extends Converter {
    constructor() {
        super('length-converter');
        // 所有转换率都基于米（m）作为基准单位
        this.rates = {
            // 公制单位
            km: 1000,      // 千米
            m: 1,          // 米（基准单位）
            dm: 0.1,       // 分米
            cm: 0.01,      // 厘米
            mm: 0.001,     // 毫米
            μm: 0.000001,  // 微米
            nm: 1e-9,      // 纳米
            
            // 英制单位
            mi: 1609.344,  // 英里
            fur: 201.168,  // 弗隆（1/8英里）
            ch: 20.1168,   // 链（1/10弗隆）
            rd: 5.0292,    // 竿（1/4链）
            yd: 0.9144,    // 码
            ft: 0.3048,    // 英尺
            in: 0.0254,    // 英寸
            mil: 0.0000254,// 密尔（千分之一英寸）
            
            // 航海单位
            nmi: 1852,     // 海里
            ftm: 1.8288,   // 英寻（6英尺）
            cable: 185.2,  // 缆（1/10海里）
            
            // 其他单位
            ly: 9.461e15,  // 光年
            au: 1.496e11,  // 天文单位
            pc: 3.086e16,  // 秒差距
            angstrom: 1e-10 // 埃
        };

        // 单位精度设置
        this.decimals = {
            // 公制单位
            km: 6,    // 千米
            m: 6,     // 米
            dm: 6,    // 分米
            cm: 6,    // 厘米
            mm: 6,    // 毫米
            μm: 6,    // 微米
            nm: 6,    // 纳米
            
            // 英制单位
            mi: 6,    // 英里
            fur: 6,   // 弗隆
            ch: 6,    // 链
            rd: 6,    // 竿
            yd: 6,    // 码
            ft: 6,    // 英尺
            in: 6,    // 英寸
            mil: 6,   // 密尔
            
            // 航海单位
            nmi: 6,   // 海里
            ftm: 6,   // 英寻
            cable: 6, // 缆
            
            // 其他单位
            ly: 6,    // 光年
            au: 6,    // 天文单位
            pc: 6,    // 秒差距
            angstrom: 6 // 埃
        };

        // 添加常用换算关系说明
        this.conversionInfo = {
            metric: [
                '1 km = 1000 m',
                '1 m = 10 dm',
                '1 dm = 10 cm',
                '1 cm = 10 mm',
                '1 mm = 1000 μm',
                '1 μm = 1000 nm'
            ],
            imperial: [
                '1 mi = 8 fur',
                '1 fur = 10 ch',
                '1 ch = 4 rd',
                '1 rd = 5.5 yd',
                '1 yd = 3 ft',
                '1 ft = 12 in',
                '1 in = 1000 mil'
            ],
            nautical: [
                '1 nmi = 10 cable',
                '1 nmi = 1.852 km',
                '1 ftm = 6 ft',
                '1 cable = 185.2 m'
            ],
            astronomical: [
                '1 ly = 9.461e15 m',
                '1 au = 149,597,870,700 m',
                '1 pc = 3.086e16 m',
                '1 angstrom = 0.1 nm'
            ]
        };
    }

    // 重写转换方法以使用新的精度设置
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

            // 先转换到米，再转换到目标单位
            const meters = value * this.rates[fromUnit];
            const result = meters / this.rates[toUnit];

            // 使用单位对应的精度
            const decimals = this.decimals[toUnit];
            this.toInput.value = result.toFixed(decimals);
            console.log(`Conversion result: ${this.toInput.value}`);

            // 更新换算关系显示
            this.updateConversionInfo(fromUnit, toUnit, value, result);
        } catch (error) {
            console.error('Conversion error:', error);
        }
    }

    // 重写反向转换方法以使用新的精度设置
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

            // 先转换到米，再转换到源单位
            const meters = value * this.rates[toUnit];
            const result = meters / this.rates[fromUnit];

            // 使用单位对应的精度
            const decimals = this.decimals[fromUnit];
            this.fromInput.value = result.toFixed(decimals);
            console.log(`Reverse conversion result: ${this.fromInput.value}`);

            // 更新换算关系显示
            this.updateConversionInfo(toUnit, fromUnit, value, result);
        } catch (error) {
            console.error('Reverse conversion error:', error);
        }
    }

    // 添加换算关系显示方法
    updateConversionInfo(fromUnit, toUnit, fromValue, toValue) {
        const infoElement = this.container.querySelector('.converter-info');
        if (infoElement) {
            const isMetricFrom = ['km', 'm', 'cm', 'mm'].includes(fromUnit);
            const isMetricTo = ['km', 'm', 'cm', 'mm'].includes(toUnit);
            
            let info = `<p>${fromValue} ${fromUnit} = ${toValue} ${toUnit}</p>`;
            info += '<p>常用换算关系：</p><ul>';
            
            // 添加相关的换算关系
            if (isMetricFrom && isMetricTo) {
                info += this.conversionInfo.metric.map(rel => `<li>${rel}</li>`).join('');
            } else if (!isMetricFrom && !isMetricTo) {
                info += this.conversionInfo.imperial.map(rel => `<li>${rel}</li>`).join('');
            } else {
                info += this.conversionInfo.crossSystem.map(rel => `<li>${rel}</li>`).join('');
            }
            
            info += '</ul>';
            infoElement.innerHTML = info;
        }
    }
}

class WeightConverter extends Converter {
    constructor() {
        super('weight-converter');
        // 所有转换率都基于千克（kg）作为基准单位
        this.rates = {
            // 公制单位
            t: 1000,       // 吨
            kg: 1,         // 千克（基准单位）
            hg: 0.1,       // 百克
            dag: 0.01,     // 十克
            g: 0.001,      // 克
            dg: 0.0001,    // 分克
            cg: 0.00001,   // 厘克
            mg: 0.000001,  // 毫克
            μg: 1e-9,      // 微克
            
            // 英制单位
            lt: 1016.047,  // 长吨
            st: 907.1847,  // 短吨
            cwt: 50.80235, // 英担
            qr: 12.70059,  // 夸特
            st_weight: 6.35029, // 石
            lb: 0.453592,  // 磅
            oz: 0.0283495, // 盎司
            dr: 0.001772,  // 打兰
            gr: 0.0000648, // 格令
            
            // 珠宝单位
            ct: 0.0002,    // 克拉
            point: 0.000002, // 分（克拉的百分之一）
            
            // 中国传统单位
            dan: 50,       // 担
            jin: 0.5,      // 斤
            liang: 0.05,   // 两
            qian: 0.005,   // 钱
            fen: 0.0005    // 分
        };

        // 单位精度设置
        this.decimals = {
            // 公制单位
            t: 6,      // 吨
            kg: 6,     // 千克
            hg: 6,     // 百克
            dag: 6,    // 十克
            g: 6,      // 克
            dg: 6,     // 分克
            cg: 6,     // 厘克
            mg: 6,     // 毫克
            μg: 6,     // 微克
            
            // 英制单位
            lt: 6,     // 长吨
            st: 6,     // 短吨
            cwt: 6,    // 英担
            qr: 6,     // 夸特
            st_weight: 6, // 石
            lb: 6,     // 磅
            oz: 6,     // 盎司
            dr: 6,     // 打兰
            gr: 6,     // 格令
            
            // 珠宝单位
            ct: 6,     // 克拉
            point: 6,  // 分
            
            // 中国传统单位
            dan: 6,    // 担
            jin: 6,    // 斤
            liang: 6,  // 两
            qian: 6,   // 钱
            fen: 6     // 分
        };

        // 添加常用换算关系说明
        this.conversionInfo = {
            metric: [
                '1 t = 1000 kg',
                '1 kg = 1000 g',
                '1 g = 1000 mg',
                '1 mg = 1000 μg'
            ],
            imperial: [
                '1 lt = 2240 lb',
                '1 st = 2000 lb',
                '1 cwt = 112 lb',
                '1 qr = 28 lb',
                '1 st_weight = 14 lb',
                '1 lb = 16 oz',
                '1 oz = 16 dr',
                '1 dr = 27.34375 gr'
            ],
            jewelry: [
                '1 ct = 0.2 g',
                '1 ct = 100 points'
            ],
            chinese: [
                '1 dan = 100 jin',
                '1 jin = 10 liang',
                '1 liang = 10 qian',
                '1 qian = 10 fen'
            ],
            crossSystem: [
                '1 kg = 2.20462 lb',
                '1 oz = 28.3495 g',
                '1 jin = 0.5 kg'
            ]
        };
    }

    // 重写转换方法以使用新的精度设置
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

            // 先转换到千克，再转换到目标单位
            const kilograms = value * this.rates[fromUnit];
            const result = kilograms / this.rates[toUnit];

            // 使用单位对应的精度
            const decimals = this.decimals[toUnit];
            this.toInput.value = result.toFixed(decimals);
            console.log(`Conversion result: ${this.toInput.value}`);

            // 更新换算关系显示
            this.updateConversionInfo(fromUnit, toUnit, value, result);
        } catch (error) {
            console.error('Conversion error:', error);
        }
    }

    // 重写反向转换方法以使用新的精度设置
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

            // 先转换到千克，再转换到源单位
            const kilograms = value * this.rates[toUnit];
            const result = kilograms / this.rates[fromUnit];

            // 使用单位对应的精度
            const decimals = this.decimals[fromUnit];
            this.fromInput.value = result.toFixed(decimals);
            console.log(`Reverse conversion result: ${this.fromInput.value}`);

            // 更新换算关系显示
            this.updateConversionInfo(toUnit, fromUnit, value, result);
        } catch (error) {
            console.error('Reverse conversion error:', error);
        }
    }

    updateConversionInfo() {
        // ... 与 LengthConverter 类似的实现 ...
    }
}

class VolumeConverter extends Converter {
    constructor() {
        super('volume-converter');
        // 所有转换率都基于升（L）作为基准单位
        this.rates = {
            // 公制单位
            m3: 1000,      // 立方米
            l: 1,          // 升（基准单位）
            dl: 0.1,       // 分升
            cl: 0.01,      // 厘升
            ml: 0.001,     // 毫升
            cm3: 0.001,    // 立方厘米（等于毫升）
            mm3: 0.000001, // 立方毫米
            
            // 英制单位
            gal: 3.78541,  // 加仑
            qt: 0.946353,  // 夸脱
            pt: 0.473176,  // 品脱
            cup: 0.236588, // 杯
            floz: 0.0295735, // 液量盎司
            tbsp: 0.0147868, // 汤匙
            tsp: 0.00492892  // 茶匙
        };

        // 单位精度设置
        this.decimals = {
            // 公制单位
            m3: 6,     // 立方米
            l: 6,      // 升
            dl: 6,     // 分升
            cl: 6,     // 厘升
            ml: 6,     // 毫升
            cm3: 6,    // 立方厘米
            mm3: 6,    // 立方毫米
            
            // 英制单位
            gal: 6,    // 加仑
            qt: 6,     // 夸脱
            pt: 6,     // 品脱
            cup: 6,    // 杯
            floz: 6,   // 液量盎司
            tbsp: 6,   // 汤匙
            tsp: 6     // 茶匙
        };

        // 添加常用换算关系说明
        this.conversionInfo = {
            metric: [
                '1 m³ = 1000 L',
                '1 L = 1000 mL',
                '1 mL = 1 cm³',
                '1 L = 10 dL',
                '1 dL = 10 cL',
                '1 cL = 10 mL'
            ],
            imperial: [
                '1 gal = 4 qt',
                '1 qt = 2 pt',
                '1 pt = 2 cup',
                '1 cup = 8 fl oz',
                '1 fl oz = 2 tbsp',
                '1 tbsp = 3 tsp'
            ],
            crossSystem: [
                '1 L = 0.264172 gal',
                '1 gal = 3.78541 L',
                '1 fl oz = 29.5735 mL',
                '1 cup = 236.588 mL'
            ]
        };
    }

    // 重写转换方法以使用新的精度设置
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

            // 先转换到升，再转换到目标单位
            const liters = value * this.rates[fromUnit];
            const result = liters / this.rates[toUnit];

            // 使用单位对应的精度
            const decimals = this.decimals[toUnit];
            this.toInput.value = result.toFixed(decimals);
            console.log(`Conversion result: ${this.toInput.value}`);

            // 更新换算关系显示
            this.updateConversionInfo(fromUnit, toUnit, value, result);
        } catch (error) {
            console.error('Conversion error:', error);
        }
    }

    // 重写反向转换方法以使用新的精度设置
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

            // 先转换到升，再转换到源单位
            const liters = value * this.rates[toUnit];
            const result = liters / this.rates[fromUnit];

            // 使用单位对应的精度
            const decimals = this.decimals[fromUnit];
            this.fromInput.value = result.toFixed(decimals);
            console.log(`Reverse conversion result: ${this.fromInput.value}`);

            // 更新换算关系显示
            this.updateConversionInfo(toUnit, fromUnit, value, result);
        } catch (error) {
            console.error('Reverse conversion error:', error);
        }
    }

    // 添加换算关系显示方法
    updateConversionInfo(fromUnit, toUnit, fromValue, toValue) {
        const infoElement = this.container.querySelector('.converter-info');
        if (infoElement) {
            const isMetricFrom = ['m3', 'l', 'dl', 'cl', 'ml', 'cm3', 'mm3'].includes(fromUnit);
            const isMetricTo = ['m3', 'l', 'dl', 'cl', 'ml', 'cm3', 'mm3'].includes(toUnit);
            
            let info = `<p>${fromValue} ${fromUnit} = ${toValue} ${toUnit}</p>`;
            info += '<p>常用换算关系：</p><ul>';
            
            // 添加相关的换算关系
            if (isMetricFrom && isMetricTo) {
                info += this.conversionInfo.metric.map(rel => `<li>${rel}</li>`).join('');
            } else if (!isMetricFrom && !isMetricTo) {
                info += this.conversionInfo.imperial.map(rel => `<li>${rel}</li>`).join('');
            } else {
                info += this.conversionInfo.crossSystem.map(rel => `<li>${rel}</li>`).join('');
            }
            
            info += '</ul>';
            infoElement.innerHTML = info;
        }
    }
}

class TemperatureConverter extends Converter {
    constructor() {
        super('temperature-converter');
        // 温度单位及其显示名称
        this.units = {
            'C': '摄氏度 (°C)',
            'F': '华氏度 (°F)',
            'K': '开尔文 (K)',
            'Ra': '兰氏度 (°Ra)',
            'Re': '列氏度 (°Re)'
        };

        // 单位精度设置
        this.decimals = {
            'C': 3,
            'F': 3,
            'K': 3,
            'Ra': 3,
            'Re': 3
        };

        // 添加常用换算关系说明
        this.conversionInfo = {
            celsius: [
                '°F = °C × 9/5 + 32',
                'K = °C + 273.15',
                '°Ra = (°C + 273.15) × 9/5',
                '°Re = °C × 4/5'
            ],
            fahrenheit: [
                '°C = (°F - 32) × 5/9',
                'K = (°F + 459.67) × 5/9',
                '°Ra = °F + 459.67',
                '°Re = (°F - 32) × 4/9'
            ],
            kelvin: [
                '°C = K - 273.15',
                '°F = K × 9/5 - 459.67',
                '°Ra = K × 9/5',
                '°Re = (K - 273.15) × 4/5'
            ]
        };
    }

    // 温度转换方法
    temperatureConvert(value, fromUnit, toUnit) {
        // 先转换为摄氏度
        let celsius;
        switch (fromUnit) {
            case 'C':
                celsius = value;
                break;
            case 'F':
                celsius = (value - 32) * 5/9;
                break;
            case 'K':
                celsius = value - 273.15;
                break;
            case 'Ra':
                celsius = (value - 491.67) * 5/9;
                break;
            case 'Re':
                celsius = value * 5/4;
                break;
            default:
                throw new Error('未知的温度单位');
        }

        // 从摄氏度转换为目标单位
        let result;
        switch (toUnit) {
            case 'C':
                result = celsius;
                break;
            case 'F':
                result = celsius * 9/5 + 32;
                break;
            case 'K':
                result = celsius + 273.15;
                break;
            case 'Ra':
                result = (celsius + 273.15) * 9/5;
                break;
            case 'Re':
                result = celsius * 4/5;
                break;
            default:
                throw new Error('未知的温度单位');
        }

        return result;
    }

    // 重写转换方法
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

            const result = this.temperatureConvert(value, fromUnit, toUnit);
            const decimals = this.decimals[toUnit];
            this.toInput.value = result.toFixed(decimals);

            // 更新换算关系显示
            this.updateConversionInfo(fromUnit, toUnit, value, result);
        } catch (error) {
            console.error('Temperature conversion error:', error);
        }
    }

    // 重写反向转换方法
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

            const result = this.temperatureConvert(value, toUnit, fromUnit);
            const decimals = this.decimals[fromUnit];
            this.fromInput.value = result.toFixed(decimals);

            // 更新换算关系显示
            this.updateConversionInfo(toUnit, fromUnit, value, result);
        } catch (error) {
            console.error('Temperature reverse conversion error:', error);
        }
    }

    // 添加换算关系显示方法
    updateConversionInfo(fromUnit, toUnit, fromValue, toValue) {
        const infoElement = this.container.querySelector('.converter-info');
        if (infoElement) {
            let info = `<p>${fromValue} ${this.units[fromUnit]} = ${toValue} ${this.units[toUnit]}</p>`;
            info += '<p>温度换算公式：</p><ul>';
            
            // 根据源单位选择显示相应的换算关系
            let formulas;
            if (fromUnit === 'C') {
                formulas = this.conversionInfo.celsius;
            } else if (fromUnit === 'F') {
                formulas = this.conversionInfo.fahrenheit;
            } else if (fromUnit === 'K') {
                formulas = this.conversionInfo.kelvin;
            }
            
            if (formulas) {
                info += formulas.map(formula => `<li>${formula}</li>`).join('');
            }
            
            info += '</ul>';
            infoElement.innerHTML = info;
        }
    }
}

class AreaConverter extends Converter {
    constructor() {
        super('area-converter');
        // 所有转换率都基于平方米（m²）作为基准单位
        this.rates = {
            // 公制单位
            km2: 1e6,      // 平方千米
            ha: 10000,     // 公顷
            a: 100,        // 公亩
            m2: 1,         // 平方米（基准单位）
            dm2: 0.01,     // 平方分米
            cm2: 0.0001,   // 平方厘米
            mm2: 0.000001, // 平方毫米
            
            // 英制单位
            mi2: 2589988.11, // 平方英里
            acre: 4046.86,   // 英亩
            rood: 1011.71,   // 路德（1/4英亩）
            yd2: 0.836127,   // 平方码
            ft2: 0.092903,   // 平方英尺
            in2: 0.00064516, // 平方英寸
            
            // 中国传统单位
            qing: 66666.67,  // 顷
            mu: 666.67,      // 亩
            fen: 66.667,     // 分
            li2: 0.0001      // 平方厘
        };

        // 单位精度设置
        this.decimals = {
            // 公制单位
            km2: 6,    // 平方千米
            ha: 6,     // 公顷
            a: 6,      // 公亩
            m2: 6,     // 平方米
            dm2: 6,    // 平方分米
            cm2: 6,    // 平方厘米
            mm2: 6,    // 平方毫米
            
            // 英制单位
            mi2: 6,    // 平方英里
            acre: 6,   // 英亩
            rood: 6,   // 路德
            yd2: 6,    // 平方码
            ft2: 6,    // 平方英尺
            in2: 6,    // 平方英寸
            
            // 中国传统单位
            qing: 6,   // 顷
            mu: 6,     // 亩
            fen: 6,    // 分
            li2: 6     // 平方厘
        };

        // 添加常用换算关系说明
        this.conversionInfo = {
            metric: [
                '1 km² = 100 ha',
                '1 ha = 10000 m²',
                '1 a = 100 m²',
                '1 m² = 100 dm²',
                '1 dm² = 100 cm²',
                '1 cm² = 100 mm²'
            ],
            imperial: [
                '1 mi² = 640 acre',
                '1 acre = 4 rood',
                '1 acre = 4840 yd²',
                '1 yd² = 9 ft²',
                '1 ft² = 144 in²'
            ],
            chinese: [
                '1 顷 = 100 亩',
                '1 亩 = 10 分',
                '1 分 = 10 平方厘'
            ],
            crossSystem: [
                '1 km² = 0.386102 mi²',
                '1 ha = 2.47105 acre',
                '1 m² = 10.7639 ft²',
                '1 亩 ≈ 666.67 m²'
            ]
        };
    }

    // 重写反向转换方法以使用新的精度设置
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

            // 先转换到平方米，再转换到源单位
            const squareMeters = value * this.rates[toUnit];
            const result = squareMeters / this.rates[fromUnit];

            // 使用单位对应的精度
            const decimals = this.decimals[fromUnit];
            this.fromInput.value = result.toFixed(decimals);
            console.log(`Reverse conversion result: ${this.fromInput.value}`);

            // 更新换算关系显示
            this.updateConversionInfo(toUnit, fromUnit, value, result);
        } catch (error) {
            console.error('Reverse conversion error:', error);
        }
    }
}

class SpeedConverter extends Converter {
    constructor() {
        super('speed-converter');
        // 所有转换率都基于米每秒（m/s）作为基准单位
        this.rates = {
            'm/s': 1,          // 米每秒（基准单位）
            'km/h': 1 / 3.6,   // 千米每小时
            'cm/s': 0.01,      // 厘米每秒
            'mm/s': 0.001,     // 毫米每秒
            'mi/h': 0.44704,   // 英里每小时
            'ft/s': 0.3048,    // 英尺每秒
            'in/s': 0.0254,    // 英寸每秒
            'knot': 0.514444,  // 节（海里每小时）
            'mach': 340.29,    // 马赫（在海平面）
            'c': 299792458     // 光速
        };

        this.decimals = {
            'm/s': 6,
            'km/h': 6,
            'cm/s': 6,
            'mm/s': 6,
            'mi/h': 6,
            'ft/s': 6,
            'in/s': 6,
            'knot': 6,
            'mach': 6,
            'c': 6
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

            const metersPerSecond = value * this.rates[fromUnit];
            const result = metersPerSecond / this.rates[toUnit];

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

            const metersPerSecond = value * this.rates[toUnit];
            const result = metersPerSecond / this.rates[fromUnit];

            const decimals = this.decimals[fromUnit];
            this.fromInput.value = result.toFixed(decimals);
            console.log(`Reverse conversion result: ${this.fromInput.value}`);
        } catch (error) {
            console.error('Reverse conversion error:', error);
        }
    }
}

class TimeConverter extends Converter {
    constructor() {
        super('time-converter');
        // 所有转换率都基于秒（s）作为基准单位
        this.rates = {
            's': 1,          // 秒（基准单位）
            'min': 60,       // 分钟
            'h': 3600,       // 小时
            'day': 86400,    // 天
            'week': 604800,  // 周
            'month': 2629800, // 月（平均值）
            'year': 31557600 // 年（平均值）
        };

        this.decimals = {
            's': 6,
            'min': 6,
            'h': 6,
            'day': 6,
            'week': 6,
            'month': 6,
            'year': 6
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

            const seconds = value * this.rates[fromUnit];
            const result = seconds / this.rates[toUnit];

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

            const seconds = value * this.rates[toUnit];
            const result = seconds / this.rates[fromUnit];

            const decimals = this.decimals[fromUnit];
            this.fromInput.value = result.toFixed(decimals);
            console.log(`Reverse conversion result: ${this.fromInput.value}`);
        } catch (error) {
            console.error('Reverse conversion error:', error);
        }
    }
}

class EnergyConverter extends Converter {
    constructor() {
        super('energy-converter');
        // 所有转换率都基于焦耳（J）作为基准单位
        this.rates = {
            'J': 1,            // 焦耳（基准单位）
            'kJ': 1000,        // 千焦耳
            'cal': 4.184,      // 卡路里
            'kcal': 4184,      // 千卡路里
            'Wh': 3600,        // 瓦时
            'kWh': 3600000,    // 千瓦时
            'BTU': 1055.06,    // 英热单位
            'eV': 1.60218e-19, // 电子伏特
            'ft-lb': 1.35582   // 英尺磅
        };

        this.decimals = {
            'J': 6,
            'kJ': 6,
            'cal': 6,
            'kcal': 6,
            'Wh': 6,
            'kWh': 6,
            'BTU': 6,
            'eV': 6,
            'ft-lb': 6
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

            const joules = value * this.rates[fromUnit];
            const result = joules / this.rates[toUnit];

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

            const joules = value * this.rates[toUnit];
            const result = joules / this.rates[fromUnit];

            const decimals = this.decimals[fromUnit];
            this.fromInput.value = result.toFixed(decimals);
            console.log(`Reverse conversion result: ${this.fromInput.value}`);
        } catch (error) {
            console.error('Reverse conversion error:', error);
        }
    }
}

class PowerConverter extends Converter {
    constructor() {
        super('power-converter');
        // 所有转换率都基于瓦特（W）作为基准单位
        this.rates = {
            'W': 1,            // 瓦特（基准单位）
            'kW': 1000,        // 千瓦
            'MW': 1e6,         // 兆瓦
            'hp': 745.7,       // 马力（机械）
            'hp_e': 735.5,     // 马力（电气）
            'ft-lb/s': 1.35582 // 英尺磅每秒
        };

        this.decimals = {
            'W': 6,
            'kW': 6,
            'MW': 6,
            'hp': 6,
            'hp_e': 6,
            'ft-lb/s': 6
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

            const watts = value * this.rates[fromUnit];
            const result = watts / this.rates[toUnit];

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

            const watts = value * this.rates[toUnit];
            const result = watts / this.rates[fromUnit];

            const decimals = this.decimals[fromUnit];
            this.fromInput.value = result.toFixed(decimals);
            console.log(`Reverse conversion result: ${this.fromInput.value}`);
        } catch (error) {
            console.error('Reverse conversion error:', error);
        }
    }
}

class DataConverter extends Converter {
    constructor() {
        super('data-converter');
        // 所有转换率都基于字节（B）作为基准单位
        this.rates = {
            'bit': 1 / 8,      // 比特
            'B': 1,            // 字节（基准单位）
            'KB': 1024,        // 千字节
            'MB': 1024 ** 2,   // 兆字节
            'GB': 1024 ** 3,   // 吉字节
            'TB': 1024 ** 4,   // 太字节
            'PB': 1024 ** 5,   // 拍字节
            'EB': 1024 ** 6,   // 艾字节
            'ZB': 1024 ** 7,   // 泽字节
            'YB': 1024 ** 8    // 尧字节
        };

        this.decimals = {
            'bit': 6,
            'B': 6,
            'KB': 6,
            'MB': 6,
            'GB': 6,
            'TB': 6,
            'PB': 6,
            'EB': 6,
            'ZB': 6,
            'YB': 6
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

            const bytes = value * this.rates[fromUnit];
            const result = bytes / this.rates[toUnit];

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

            const bytes = value * this.rates[toUnit];
            const result = bytes / this.rates[fromUnit];

            const decimals = this.decimals[fromUnit];
            this.fromInput.value = result.toFixed(decimals);
            console.log(`Reverse conversion result: ${this.fromInput.value}`);
        } catch (error) {
            console.error('Reverse conversion error:', error);
        }
    }
}

class PressureConverter extends Converter {
    constructor() {
        super('pressure-converter');
        // 所有转换率都基于帕斯卡（Pa）作为基准单位
        this.rates = {
            'Pa': 1,            // 帕斯卡（基准单位）
            'kPa': 1000,        // 千帕
            'MPa': 1e6,         // 兆帕
            'bar': 1e5,         // 巴
            'atm': 101325,      // 标准大气压
            'psi': 6894.76,     // 磅力每平方英寸
            'torr': 133.322     // 毫米汞柱
        };

        this.decimals = {
            'Pa': 6,
            'kPa': 6,
            'MPa': 6,
            'bar': 6,
            'atm': 6,
            'psi': 6,
            'torr': 6
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

            const pascals = value * this.rates[fromUnit];
            const result = pascals / this.rates[toUnit];

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

            const pascals = value * this.rates[toUnit];
            const result = pascals / this.rates[fromUnit];

            const decimals = this.decimals[fromUnit];
            this.fromInput.value = result.toFixed(decimals);
            console.log(`Reverse conversion result: ${this.fromInput.value}`);
        } catch (error) {
            console.error('Reverse conversion error:', error);
        }
    }
}

class AngleConverter extends Converter {
    constructor() {
        super('angle-converter');
        // 所有转换率都基于度（°）作为基准单位
        this.rates = {
            'deg': 1,            // 度（基准单位）
            'rad': 180 / Math.PI, // 弧度
            'grad': 0.9,         // 刻度
            'min': 1 / 60,       // 分
            'sec': 1 / 3600      // 秒
        };

        this.decimals = {
            'deg': 6,
            'rad': 6,
            'grad': 6,
            'min': 6,
            'sec': 6
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

            const degrees = value * this.rates[fromUnit];
            const result = degrees / this.rates[toUnit];

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

            const degrees = value * this.rates[toUnit];
            const result = degrees / this.rates[fromUnit];

            const decimals = this.decimals[fromUnit];
            this.fromInput.value = result.toFixed(decimals);
            console.log(`Reverse conversion result: ${this.fromInput.value}`);
        } catch (error) {
            console.error('Reverse conversion error:', error);
        }
    }
}

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
            'ppb': 1e7             // 十亿分之一
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