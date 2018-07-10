import { PROP_METADATA } from '../../libs/decorators';
import { IpcHub } from '../../libs/ipc';


export abstract class Service {
    protected ipc: IpcHub;

    protected constructor(public readonly serviceName: string) {
        this.ipc = new IpcHub(serviceName);
        this.ipc.setErrorHandler(this.handleError.bind(this));

        const actionHandlers = this.constructor[PROP_METADATA];

        if (actionHandlers) {
            for (const name of Object.keys(actionHandlers)) {
                const action = actionHandlers[name][0].action;
                const method = this[name];

                this.ipc.registerActionHandler(action, method.bind(this));
            }
        }
    }

    abstract init(...di: any[]): void | Promise<void>;
    abstract handleError(error: any): any;

    destroy(): void {
        this.ipc.destroy();
    }
}
