import { environment } from '../../environments/environment';
import { Window, WindowEvents } from '../interfaces/window';


export class AppWindow extends Window {
    constructor() {
        super('browser/app/app.html', {
            minWidth: 600,
            minHeight: 360,
            width: 1280,
            height: 768,
            show: false,
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
            this.emit(WindowEvents.CLOSED);
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
