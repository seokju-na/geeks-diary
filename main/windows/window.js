const { BrowserWindow } = require('electron');
const EventEmitter = require('events');
const url = require('url');


class Window extends EventEmitter {
    constructor(templateUrl, options) {
        super();

        this.url = templateUrl;
        this.browserWindow = new BrowserWindow(options);

        this.handleEvents();
    }

    handleEvents() {
        this.browserWindow.on('closed', () => {
            this.emit('closed');
        });
    }

    open() {
        const templateUrl = url.format({
            protocol: 'file',
            pathname: this.url,
            slashes: true
        });

        this.browserWindow.loadURL(templateUrl);
    }
}

module.exports = Window;
