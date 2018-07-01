export type IpcChannelActionHandler<T = any, R = any> = (data?: T) => Promise<R>;


export interface IpcChannelRequest<T> {
    action: string;
    data?: T;
}


export interface IpcChannelActionResponse<R = any> {
    result?: R;
    error?: any;
}


function getResponseChannelName(namespace: string, action: string): string {
    return `${namespace}-${action}-response`;
}


export class IpcChannelServer {
    private readonly ipcMain: Electron.IpcMain;
    private readonly handlers = new Map<string, IpcChannelActionHandler>();
    private errorHandler: (error: any) => any;
    private readonly listener: any;

    constructor(readonly namespace: string) {
        this.ipcMain = require('electron').ipcMain;
        this.listener = (event: any, request: IpcChannelRequest<any>) =>
            this.handleEvent(event, request);
        this.ipcMain.on(this.namespace, this.listener);
    }

    destroy(): void {
        this.handlers.clear();
        this.ipcMain.removeListener(this.namespace, this.listener);
    }

    registerActionHandler(action: string, handler: IpcChannelActionHandler): void {
        this.handlers.set(action, handler);
    }

    setErrorHandler(handler: (error: any) => any): void {
        this.errorHandler = handler;
    }

    private async handleEvent(event: any, request: IpcChannelRequest<any>): Promise<void> {
        const responseChannelName = getResponseChannelName(this.namespace, request.action);

        if (!this.handlers.has(request.action)) {
            return;
        }

        console.log(`IpcServer event received: ${request.action}`);

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


export class IpcChannelClient {
    private readonly ipcRenderer: Electron.IpcRenderer;

    constructor(readonly namespace: string) {
        this.ipcRenderer = require('electron').ipcRenderer;
    }

    request<T, R>(action: string, data?: T): Promise<R> {
        return new Promise<R>((resolve, reject) => {
            const responseChannelName = getResponseChannelName(this.namespace, action);
            const request: IpcChannelRequest<T> = { action, data };

            this.ipcRenderer.once(
                responseChannelName,
                (event: any, response: IpcChannelActionResponse) => {
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
