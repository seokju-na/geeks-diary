import { EventEmitter } from 'events';
import { PROP_METADATA } from '../../libs/decorators';
import { IpcActionServer } from '../../libs/ipc';


export abstract class Service extends EventEmitter {
    protected ipc: IpcActionServer;

    protected constructor(public readonly name: string) {
        super();

        this.ipc = new IpcActionServer(name);
        this.ipc.setActionErrorHandler(error => this.handleError(error));

        // Assign actions handlers
        const actionHandlers = this.constructor[PROP_METADATA];

        if (actionHandlers) {
            for (const actionName of Object.keys(actionHandlers)) {
                const action = actionHandlers[actionName][0].action;
                const method = this[actionName];

                this.ipc.setActionHandler(action, method.bind(this));
            }
        }
    }

    abstract init(...di: Service[]): void | Promise<void>;
    abstract handleError<E = any, T = any>(error: E): T;

    destroy(): void {
        this.ipc.destroy();
    }
}
