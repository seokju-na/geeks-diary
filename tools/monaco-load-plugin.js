const fs = require('fs');
const util = require('util');


class MonacoLoadPlugin {
    constructor(monacoLoadFileName, place) {
        this.monacoLoadFileName = monacoLoadFileName;
        this.place = place;
    }

    async loadMonacoInsertion() {
        const readFile = util.promisify(fs.readFile);

        try {
            const data = await readFile(this.monacoLoadFileName);

            return data.toString('utf8');
        } catch (err) {
            return '';
        }
    }

    apply(compiler) {
        compiler.plugin('compilation', (compilation) => {
            compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPluginData, callback) => {
                this.loadMonacoInsertion()
                    .then((data) => {
                        const regExp = new RegExp(this.place);

                        htmlPluginData.html = htmlPluginData.html.replace(regExp, data);

                        callback(null, htmlPluginData);
                    });
            });
        });
    }
}


module.exports = MonacoLoadPlugin;
