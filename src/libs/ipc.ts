import { IpcMain, IpcRenderer } from 'electron';
import { makePropDecorator } from './decorators';


type IpcHubActionHandler<T = any, R = any> = (data?: T) => Promise<R>;


export interface IpcRequest<T> {
    action: string;
    data?: T;
}


export interface IpcResponse<R = any> {
    result?: R;
    error?: any;
}


function getResponseChannelName(namespace: string, action: string): string {
    return `${namespace}-${action}-response`;
}


interface IpcActionHandlerDecorator {
    (action: string): any;
    new (action: string): any;
}


/**
 * Ipc action handler registering decorator.
 *
 * @example
 * class SomeService extends Service {
 *     @IpcActionHandler('create')
 *     async createSomething(data?: any): Promise<Something> {
 *         ...
 *     }
 *     ...
 * }
 */
export const IpcActionHandler: IpcActionHandlerDecorator =
    makePropDecorator('IpcActionHandler', (action: string) => ({ action }));


/**
 * Ipc hub used in main process.
 *
 * When action requested, handle the request and send response
 * which generated from registered handler.
 *
 * @example
 * const hub = new IpcServer('serviceName');
 *
 * hub.registerActionHandler('actionA', async (data) => {
 *     const result = await someAsyncTask(data);
 *     return result;
 * });
 */
export class IpcServer {
    private readonly ipcMain: IpcMain;
    private readonly handlers = new Map<string, IpcHubActionHandler>();
    private errorHandler: (error: any) => any;
    private readonly listener: any;

    constructor(readonly namespace: string) {
        this.ipcMain = require('electron').ipcMain;
        this.listener = (event: any, request: IpcRequest<any>) =>
            this.handleEvent(event, request);
        this.ipcMain.on(this.namespace, this.listener);
    }

    destroy(): void {
        this.handlers.clear();
        this.ipcMain.removeListener(this.namespace, this.listener);
    }

    registerActionHandler(action: string, handler: IpcHubActionHandler): void {
        this.handlers.set(action, handler);
    }

    setErrorHandler(handler: (error: any) => any): void {
        this.errorHandler = handler;
    }

    private async handleEvent(event: any, request: IpcRequest<any>): Promise<void> {
        const responseChannelName = getResponseChannelName(this.namespace, request.action);

        if (!this.handlers.has(request.action)) {
            return;
        }

        const handler = this.handlers.get(request.action);
        let result = null;
        let error = null;

        try {
            result = await handler(request.data);
        } catch (err) {
            if (this.errorHandler) {
                error = this.errorHandler(err);
            } else {
                error = err;
            }
        }

        event.sender.send(responseChannelName, { result, error });
    }
}


/**
 * Ipc hub client used in renderer process.
 *
 * @example
 * const client = new IpcClient('serviceName');
 * const result = await client.request<RequestDate, ResponseDate>('actionA', data);
 */
export class IpcClient {
    private readonly ipcRenderer: IpcRenderer;

    constructor(readonly namespace: string) {
        this.ipcRenderer = require('electron').ipcRenderer;
    }

    request<T, R>(action: string, data?: T): Promise<R> {
        return new Promise<R>((resolve, reject) => {
            const responseChannelName = getResponseChannelName(this.namespace, action);
            const request: IpcRequest<T> = { action, data };

            this.ipcRenderer.once(
                responseChannelName,
                (event: any, response: IpcResponse) => {
                    if (response.error) {
                        reject(response.error);
                    } else {
                        resolve(response.result);
                    }
                },
            );

            this.ipcRenderer.send(this.namespace, request);
        });
    }
}
