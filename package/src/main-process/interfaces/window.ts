import { EventEmitter } from 'events';
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { encodePathAsUrl } from '../../libs/path';


export enum WindowEvents {
    CLOSED = 'window.closed',
}


export abstract class Window extends EventEmitter {
    protected readonly win: BrowserWindow;
    protected readonly options: BrowserWindowConstructorOptions;
    protected readonly url: string;

    protected constructor(
        htmlPath: string,
        options: BrowserWindowConstructorOptions,
    ) {

        super();

        this.url = encodePathAsUrl(__dirname, htmlPath);
        this.options = { ...options };
        this.win = new BrowserWindow(this.options);

        this.handleEvents();
    }

    abstract handleEvents(): void;

    open(): void {
        this.win.loadURL(this.url);
    }

    close(): void {
        this.win.close();
    }
}
