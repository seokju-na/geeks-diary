const fs = require('fs');
const util = require('util');
const defaultTheme = require('../src/default-theme.json');


class DefaultThemeGenerator {
    constructor(fileName) {
        this.fileName = fileName;
    }

    apply(compiler) {
        compiler.plugin('emit', async (compilation, callback) => {
            const writeFile = util.promisify(fs.writeFile);

            try {
                await writeFile(this.fileName, this.parseThemeAsStylesheet(), 'utf8');
                callback();
            } catch (error) {
                callback(error);
            }
        });
    }

    parseThemeAsStylesheet() {
        const stylesheet = [
            ':root {'
        ];

        // Primary color
        const primaryColors = defaultTheme.color.primary;

        Object.keys(primaryColors).forEach((name) => {
            const colorName = `color-primary-${name}`;
            const value = primaryColors[name];

            this.appendValue(stylesheet, colorName, value);
        });

        // Main color
        this.appendValue(stylesheet, 'color-main', defaultTheme.color.main);

        // Background color
        this.appendValue(stylesheet, 'color-background', defaultTheme.color.background);

        // Size
        const size = defaultTheme.size;

        Object.keys(size).forEach((type) => {
            Object.keys(size[type]).forEach((unit) => {
                this.appendValue(stylesheet, `size-${type}-${unit}`, size[type][unit]);
            });
        });

        stylesheet.push('}');

        return stylesheet.join('\n');
    }

    appendValue(stylesheet, name, value) {
        stylesheet.push(`--${name}: ${value};`);
    }
}


module.exports = DefaultThemeGenerator;
