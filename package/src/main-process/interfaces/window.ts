import { EventEmitter } from 'events';
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { encodePathAsUrl } from '../../libs/path';


export abstract class Window extends EventEmitter {
    readonly browserWindow: BrowserWindow;
    readonly options: BrowserWindowConstructorOptions;
    readonly url: string;

    protected constructor(
        htmlPath: string,
        options: BrowserWindowConstructorOptions,
    ) {

        super();

        this.url = encodePathAsUrl(__dirname, htmlPath);
        this.options = { ...options };
        this.browserWindow = new BrowserWindow(this.options);

        this.handleEvents();
    }

    abstract handleEvents(): void;

    open(): Window {
        this.browserWindow.loadURL(this.url);
        return this;
    }
}
