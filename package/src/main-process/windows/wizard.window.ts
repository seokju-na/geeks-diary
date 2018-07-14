import { environment } from '../../environments/environment';
import { Window } from '../interfaces/window';


export class WizardWindow extends Window {
    constructor() {
        super('browser/wizard/wizard.html', {
            width: environment.production ? 600 : 1000,
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
        this.win.once('ready-to-show', () => {
            this.win.show();
        });

        this.win.on('closed', () => {
            this.emit('closed');
        });

        this.win.webContents.on('did-finish-load', () => {
            if (!environment.production) {
                this.win.webContents.openDevTools();
            }

            // Disable zooming.
            if (environment.production) {
                this.win.webContents.setVisualZoomLevelLimits(1, 1);
            }
        });
    }
}
