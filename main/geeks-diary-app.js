const { app, globalShortcut } = require('electron');
const EventEmitter = require('events');
const MainWindow = require('./windows/main-window');


class App extends EventEmitter {
    constructor() {
        super();

        this.windows = [];
        this.handleEvents();
    }

    handleEvents() {
        this.on('app.openWindow', () => {
            this.openWindow();
        });

        app.on('activate', (event, hasVisibleWindows) => {
            if (!hasVisibleWindows) {
                this.emit('app.openWindow');
            }
        });

        app.on('window-all-closed', () => {
            if (process.platform in ['win32', 'linux']) {
                app.quit();
            }
        });
    }

    initialize() {
        globalShortcut.register('Shift+Enter', (event) => {
            console.log(event);
        });
    }

    openWindow() {
        const win = new MainWindow();

        win.on('closed', () => {
            this.removeWindow(win);
        });
        win.open();

        this.windows.push(win);
    }

    removeWindow(window) {
        const idx = this.windows.findIndex(w => w === window);

        if (idx !== -1) {
            this.windows.splice(idx, 1);
        }
    }

    run() {
        this.openWindow();
        this.initialize();
    }
}

module.exports = App;
