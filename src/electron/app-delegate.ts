import { app } from 'electron';
import * as EventEmitter from 'events';
import { GitService } from './services/git.service';
import { AppWindow } from './windows/app-window';
import { Window } from './windows/window';


class AppDelegate extends EventEmitter {
    private readonly windows: Window[] = [];
    private readonly gitService = new GitService();

    init(): void {
        this.gitService.init();
    }

    handleEvents() {
        this.on('app.openWindow', () => {
            this.openAppWindow();
        });

        app.on('activate', (event, hasVisibleWindows) => {
            if (!hasVisibleWindows) {
                this.emit('app.openWindow');
            }
        });

        app.on('window-all-closed', () => {
            if (process.platform in ['win32', 'linux']) {
                app.quit();
            }
        });
    }

    openAppWindow() {
        const win = new AppWindow();

        win.on('closed', () => {
            this.removeWindow(win);
        });

        win
            .handleEvents()
            .open();

        this.windows.push(win);
    }

    removeWindow(win: Window) {
        const idx = this.windows.findIndex(w => w === win);

        if (idx !== -1) {
            this.windows.splice(idx, 1);
        }
    }

    run() {
        // Menu.setApplicationMenu(applicationMenu);

        this.handleEvents();
        this.openAppWindow();
    }
}

export const appDelegate = new AppDelegate();
