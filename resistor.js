class ResistorCalculator {
    constructor() {
        // 定义标准阻值序列
        this.series = {
            // E6系列(20%) - 6个值/十倍程
            E6: [1.0, 1.5, 2.2, 3.3, 4.7, 6.8].reduce((acc, val) => {
                return acc.concat([val, val * 10]);
            }, []).sort((a, b) => a - b).filter(v => v <= 100),

            // E12系列(10%) - 12个值/十倍程
            E12: [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2].reduce((acc, val) => {
                return acc.concat([val, val * 10]);
            }, []).sort((a, b) => a - b).filter(v => v <= 100),

            // E24系列(5%) - 24个值/十倍程
            E24: [1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 
                  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1].reduce((acc, val) => {
                return acc.concat([val, val * 10]);
            }, []).sort((a, b) => a - b).filter(v => v <= 100),

            // E48系列(2%) - 48个值/十倍程
            E48: [1.00, 1.05, 1.10, 1.15, 1.21, 1.27, 1.33, 1.40, 1.47, 1.54, 1.62, 1.69,
                  1.78, 1.87, 1.96, 2.05, 2.15, 2.26, 2.37, 2.49, 2.61, 2.74, 2.87, 3.01,
                  3.16, 3.32, 3.48, 3.65, 3.83, 4.02, 4.22, 4.42, 4.64, 4.87, 5.11, 5.36,
                  5.62, 5.90, 6.19, 6.49, 6.81, 7.15, 7.50, 7.87, 8.25, 8.66, 9.09, 9.53].reduce((acc, val) => {
                return acc.concat([val, val * 10]);
            }, []).sort((a, b) => a - b).filter(v => v <= 100),

            // E96系列(1%) - 96个值/十倍程
            E96: [1.00, 1.02, 1.05, 1.07, 1.10, 1.13, 1.15, 1.18, 1.21, 1.24, 1.27, 1.30,
                  1.33, 1.37, 1.40, 1.43, 1.47, 1.50, 1.54, 1.58, 1.62, 1.65, 1.69, 1.74,
                  1.78, 1.82, 1.87, 1.91, 1.96, 2.00, 2.05, 2.10, 2.15, 2.21, 2.26, 2.32,
                  2.37, 2.43, 2.49, 2.55, 2.61, 2.67, 2.74, 2.80, 2.87, 2.94, 3.01, 3.09,
                  3.16, 3.24, 3.32, 3.40, 3.48, 3.57, 3.65, 3.74, 3.83, 3.92, 4.02, 4.12,
                  4.22, 4.32, 4.42, 4.53, 4.64, 4.75, 4.87, 4.99, 5.11, 5.23, 5.36, 5.49,
                  5.62, 5.76, 5.90, 6.04, 6.19, 6.34, 6.49, 6.65, 6.81, 6.98, 7.15, 7.32,
                  7.50, 7.68, 7.87, 8.06, 8.25, 8.45, 8.66, 8.87, 9.09, 9.31, 9.53, 9.76].reduce((acc, val) => {
                return acc.concat([val, val * 10]);
            }, []).sort((a, b) => a - b).filter(v => v <= 100)
        };
        
        this.tolerances = {
            E6: 0.2,    // 20%
            E12: 0.1,   // 10%
            E24: 0.05,  // 5%
            E48: 0.02,  // 2%
            E96: 0.01   // 1%
        };
        
        this.colorCodes = {
            0: { color: 'black', name: '黑' },
            1: { color: 'brown', name: '棕' },
            2: { color: 'red', name: '红' },
            3: { color: 'orange', name: '橙' },
            4: { color: 'yellow', name: '黄' },
            5: { color: 'green', name: '绿' },
            6: { color: 'blue', name: '蓝' },
            7: { color: 'violet', name: '紫' },
            8: { color: 'gray', name: '灰' },
            9: { color: 'white', name: '白' }
        };
    }
    
    init() {
        this.seriesSelector = document.getElementById('resistorSeries');
        this.tableBody = document.getElementById('resistorTableBody');
        
        if (this.seriesSelector && this.tableBody) {
            this.seriesSelector.addEventListener('change', () => {
                this.updateTable();
            });
            
            // 初始加载E6系列
            this.updateTable();
        }
    }
    
    updateTable() {
        const selectedSeries = this.seriesSelector.value;
        const values = this.series[selectedSeries];
        const tolerance = this.tolerances[selectedSeries];
        
        this.tableBody.innerHTML = '';
        
        values.forEach(value => {
            const row = document.createElement('tr');
            
            // 计算误差范围
            const minValue = value * (1 - tolerance);
            const maxValue = value * (1 + tolerance);
            
            // 获取色环标识
            const colorBands = this.getColorBands(value, selectedSeries);
            
            // 格式化显示值
            const displayValue = this.formatResistorValue(value);
            const displayMin = this.formatResistorValue(minValue);
            const displayMax = this.formatResistorValue(maxValue);
            
            row.innerHTML = `
                <td>${displayValue}</td>
                <td>${this.formatColorBands(colorBands)}</td>
                <td>${displayMin}</td>
                <td>${displayMax}</td>
            `;
            
            this.tableBody.appendChild(row);
        });
    }
    
    // 格式化电阻值显示
    formatResistorValue(value) {
        if (value < 1) {
            return `${(value * 1000).toFixed(1)}mΩ`;
        } else if (value < 1000) {
            return `${value.toFixed(2)}Ω`;
        } else {
            return `${(value/1000).toFixed(2)}kΩ`;
        }
    }
    
    getColorBands(value, series) {
        // 将值转换为色环
        const digits = value.toFixed(2).replace('.', '');
        const bands = [];
        
        // 添加前两个数字的色环
        for (let i = 0; i < 2; i++) {
            if (digits[i]) {
                bands.push(parseInt(digits[i]));
            }
        }
        
        // 添加乘数色环
        const multiplier = Math.floor(Math.log10(value));
        bands.push(multiplier);
        
        // 添加误差色环
        const toleranceColors = {
            0.01: { color: 'brown', name: '棕' },    // 1%
            0.02: { color: 'red', name: '红' },      // 2%
            0.05: { color: 'gold', name: '金' },     // 5%
            0.1: { color: 'silver', name: '银' },    // 10%
            0.2: { color: 'none', name: '无' }       // 20%
        };
        
        const tolerance = this.tolerances[series];
        if (toleranceColors[tolerance]) {
            bands.push(toleranceColors[tolerance]);
        }
        
        return bands;
    }
    
    formatColorBands(bands) {
        return bands.map((band, index) => {
            if (index === bands.length - 1 && typeof band === 'object') {
                // 处理误差色环
                return `<span class="color-band" style="background-color: ${band.color}">${band.name}</span>`;
            }
            const color = this.colorCodes[band];
            return `<span class="color-band" style="background-color: ${color.color}">${color.name}</span>`;
        }).join(' ');
    }
}

// 在页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    const resistorCalc = new ResistorCalculator();
    resistorCalc.init();
}); 