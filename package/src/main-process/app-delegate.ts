import { app } from 'electron';
import { EventEmitter } from 'events';
import { platformMatches, PlatformTypes } from '../libs/platform';
import { Window } from './interfaces/window';
import { GitService } from './services/git.service';
import { WorkspaceService } from './services/workspace.service';
import { AppWindow } from './windows/app.window';
import { WizardWindow } from './windows/wizard.window';


class AppDelegate extends EventEmitter {
    private readonly windows: Window[] = [];
    private readonly workspace = new WorkspaceService();
    private readonly git = new GitService();

    async run(): Promise<void> {
        await Promise.all([
            this.git.init(),
            this.workspace.init(this.git),
        ]);

        this.handleEvents();

        if (this.workspace.initialized) {
            this.openAppWindow();
        } else {
            this.openWizardWindow();
        }
    }

    private handleEvents() {
        this.on('app.openWindow', () => {
            this.openAppWindow();
        });

        app.on('activate', (event, hasVisibleWindows) => {
            if (!hasVisibleWindows) {
                this.emit('app.openWindow');
            }
        });

        app.on('window-all-closed', () => {
            if (platformMatches(PlatformTypes.WIN32, PlatformTypes.LINUX)) {
                app.quit();
            }
        });
    }

    private openAppWindow(): void {
        const win = new AppWindow();

        win.on('closed', () => {
            this.removeWindow(win);
        });
        win.open();

        this.windows.push(win);
    }

    private openWizardWindow(): void {
        const win = new WizardWindow();

        win.on('closed', () => {
            this.removeWindow(win);
        });
        win.open();

        this.windows.push(win);
    }

    private removeWindow(win: Window) {
        const idx = this.windows.findIndex(w => w === win);

        if (idx !== -1) {
            this.windows.splice(idx, 1);
        }
    }
}


export const appDelegate = new AppDelegate();
