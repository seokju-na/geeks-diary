const path = require('path');
const Window = require('./window');
const env = require('../env');


class MainWindow extends Window {
    constructor() {
        const templateUrl = path.resolve(env.paths.renderer.build, 'index.html');
        const options = {
            width: 768,
            height: 600,
            minWidth: 600,
            minHeight: 480
        };

        super(templateUrl, options);
    }
}

module.exports = MainWindow;
