import { Window } from './window';


export class AppWindow extends Window {
    constructor() {
        super('index.html', {
            width: 1024,
            height: 960,
            minWidth: 700,
            minHeight: 480,
        });
    }
}
