import { BrowserWindow, IpcMain, IpcRenderer } from 'electron';
import { Observable, Subject } from 'rxjs';
import { makePropDecorator } from './decorators';


type IpcActionHandler<T, R> = (data?: T) => Promise<R>;

export interface IpcAction<D> {
    name: string;
    data?: D;
}

export interface IpcActionResponse<R = any> {
    result?: R;
    error?: any;
}

function makeResponseChannelName(namespace: string, actionName: string): string {
    return `${namespace}-${actionName}-response`;
}


export interface IpcMessage<D> {
    name: string;
    data?: D;
}


/**
 * Decorator for registering action handler in specific class.
 *
 * @example
 * class SomeService {
 *     ...
 *
 *     @IpcActionHandler('create')
 *     async createSomething(data?: RequestData): Promise<ResponseData> {
 *         ...
 *     }
 * }
 */
export const IpcActionHandler: {
    (actionName: string): any;
    new(actionName: string): any;
} = makePropDecorator('IpcActionHandler', (actionName: string) => ({ actionName }));


/**
 * Ipc action server used in main process.
 * When action is requested, handle the action and response result or error which generated from registered handlers.
 *
 * @example
 * const server = new IpcActionServer('service-id');
 *
 * server.setActionHandler<string, string>('actionA', async (data: string) => {
 *     const result = await someAsyncTask(data);
 *     return result as string;
 * });
 */
export class IpcActionServer {
    readonly _ipc: IpcMain;

    // private readonly actionHandler
    private readonly actionHandlers = new Map<string, IpcActionHandler<any, any>>();
    private actionErrorHandler: (error: any) => any;
    private readonly actionListener: any;

    constructor(public readonly namespace: string) {
        this._ipc = require('electron').ipcMain;

        this.actionListener = (event: any, action: IpcAction<any>) => this.handleIpcEvent(event, action);
        this._ipc.on(this.namespace, this.actionListener);
    }

    destroy(): void {
        this.actionHandlers.clear();
        this._ipc.removeListener(this.namespace, this.actionListener);
    }

    setActionHandler<D, R>(actionName: string, handler: IpcActionHandler<D, R>): this {
        this.actionHandlers.set(actionName, handler);
        return this;
    }

    setActionErrorHandler(handler: (error: any) => any): this {
        this.actionErrorHandler = handler;
        return this;
    }

    sendMessage<D>(window: BrowserWindow, message: IpcMessage<D>): void {
        window.webContents.send(this.namespace, message);
    }

    private async handleIpcEvent(event: any, action: IpcAction<any>): Promise<void> {
        if (!this.actionHandlers.has(action.name)) {
            return;
        }

        const handler = this.actionHandlers.get(action.name);

        let result = null;
        let error = null;

        try {
            result = await handler(action.data);
        } catch (err) {
            error = this.actionErrorHandler ? this.actionErrorHandler(err) : err;
        }

        event.sender.send(makeResponseChannelName(this.namespace, action.name), { result, error } as IpcActionResponse);
    }
}


/**
 * Ipc action client used in renderer process.
 *
 * @example
 * const client = new IpcActionClient('service-id');
 * const result = await client.performAction<RequestData, ResponseData>('actionA', data);
 */
export class IpcActionClient {
    readonly _ipc: IpcRenderer;

    private readonly messageListener: any;
    private readonly messageStream = new Subject<IpcMessage<any>>();

    constructor(public readonly namespace: string) {
        this._ipc = require('electron').ipcRenderer;

        this.messageListener =  (event: any, message: IpcMessage<any>) => this.handleIpcEvent(message);
        this._ipc.on(namespace, this.messageListener);
    }

    destroy(): void {
        this._ipc.removeListener(this.namespace, this.messageListener);
    }

    /** Send action to server which handles ipc main. */
    performAction<D, R>(actionName: string, data?: D): Promise<R> {
        return new Promise<R>((resolve, reject) => {
            const channelName = makeResponseChannelName(this.namespace, actionName);
            const action: IpcAction<D> = { name: actionName, data };

            // Listen for response event for once.
            this._ipc.once(channelName, (event: any, response: IpcActionResponse<R>) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.result);
                }
            });

            this._ipc.send(this.namespace, action);
        });
    }

    onMessage<D>(): Observable<IpcMessage<D>> {
        return this.messageStream.asObservable();
    }

    private handleIpcEvent(message: IpcMessage<any>): void {
        this.messageStream.next(message);
    }
}
