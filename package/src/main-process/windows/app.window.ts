import { environment } from '../../environments/environment';
import { Window } from '../interfaces/window';


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
        this.browserWindow.once('ready-to-show', () => {
            this.browserWindow.show();
        });

        this.browserWindow.on('closed', () => {
            this.emit('closed');
        });
    }
}
