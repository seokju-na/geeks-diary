import { BrowserWindow } from 'electron';
import * as EventEmitter from 'events';


export class Window extends EventEmitter {
    readonly browserWindow: Electron.BrowserWindow;
    readonly options: Electron.BrowserWindowConstructorOptions;
    readonly url: string;

    constructor(url: string, options: Electron.BrowserWindowConstructorOptions) {
        super();

        this.url = url;
        this.options = options;
        this.browserWindow = new BrowserWindow(this.options);
    }

    handleEvents(): Window {
        this.browserWindow.on('closed', () => {
            this.emit('closed');
        });

        return this;
    }

    open(): Window {
        this.browserWindow.loadURL(this.url);
        return this;
    }
}
