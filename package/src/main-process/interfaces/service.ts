import { IpcHub } from '../../libs/ipc';


export abstract class Service {
    protected ipc: IpcHub;

    protected constructor(public readonly serviceName: string) {
        this.ipc = new IpcHub(serviceName);
        this.ipc.setErrorHandler(this.handleError.bind(this));
    }

    abstract init(...di: any[]): void | Promise<void>;
    abstract handleError(error: any): any;

    destroy(): void {
        this.ipc.destroy();
    }
}
