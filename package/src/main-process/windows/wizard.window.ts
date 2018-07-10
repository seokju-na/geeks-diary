import { environment } from '../../environments/environment';
import { Window } from '../interfaces/window';


export class WizardWindow extends Window {
    constructor() {
        super('browser/wizard/wizard.html', {
            width: 640,
            height: 415,
            resizable: false,
            maximizable: false,
            show: false,
            fullscreenable: false,
            webPreferences: {
                devTools: !environment.production,
            },
            titleBarStyle: 'hidden',
            title: 'Geeks Diary',
        });
    }

    handleEvents(): void {
        this.browserWindow.once('ready-to-show', () => {
            this.browserWindow.show();
        });

        this.browserWindow.on('closed', () => {
            this.emit('closed');
        });
    }
}
