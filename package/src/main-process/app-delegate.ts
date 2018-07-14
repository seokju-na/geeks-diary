import { app, session } from 'electron';
import { EventEmitter } from 'events';
import { __DARWIN__ } from '../libs/platform';
import { Window, WindowEvents } from './interfaces/window';
import { GitService } from './services/git.service';
import { WorkspaceEvents, WorkspaceService } from './services/workspace.service';
import { AppWindow } from './windows/app.window';
import { WizardWindow } from './windows/wizard.window';


enum AppDelegateEvents {
    OPEN_WINDOW = 'app.openWindow',
}


class AppDelegate extends EventEmitter {
    readonly windows: Window[] = [];
    readonly workspace = new WorkspaceService();
    readonly git = new GitService();

    currentOpenWindow: Window | null = null;
    preventQuit: boolean = false;

    async run(): Promise<void> {
        await Promise.all([
            this.git.init(),
            this.workspace.init(this.git),
        ]);

        this.handleEvents();
        this.openDefaultWindow();
    }

    openDefaultWindow(): void {
        if (this.workspace.initialized) {
            this.openWindow('app');
        } else {
            this.openWindow('wizard');
        }
    }

    openWindow(name: 'app' | 'wizard'): void {
        let win: Window;

        switch (name) {
            case 'app': win = new AppWindow(); break;
            case 'wizard': win = new WizardWindow(); break;
            default: throw new Error('Cannot open window.');
        }

        win.on(WindowEvents.CLOSED, () => this.removeWindow(win));
        win.open();

        this.currentOpenWindow = win;
        this.windows.push(win);
    }

    closeCurrentWindow(): void {
        if (this.currentOpenWindow) {
            this.currentOpenWindow.close();
        }
    }

    private handleEvents() {
        this.on(AppDelegateEvents.OPEN_WINDOW, () => {
            this.openDefaultWindow();
        });

        app.on('activate', (event, hasVisibleWindows) => {
            if (!hasVisibleWindows) {
                this.emit(AppDelegateEvents.OPEN_WINDOW);
            }
        });

        app.on('window-all-closed', () => {
            if (!__DARWIN__ && !this.preventQuit) {
                app.quit();
            }
        });

        /** Prevent links or window.open from opening new windows. */
        app.on('web-contents-created', (_, contents) => {
            contents.on('new-window', (event) => {
                event.preventDefault();
            });
        });

        /**
         * Handle workspace 'CREATED' event.
         *
         * It will be handle for once because workspace is initialized
         * only at first time.
         * */
        this.workspace.once(WorkspaceEvents.CREATED, async () => {
            // Since current window is 'WizardWindow', close it
            // and open 'AppWindow'.
            this.closeCurrentWindow();
            this.openWindow('app');
        });

        /** Handle session. */
        session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
            // Set user agent.
            details.requestHeaders['User-Agent'] = 'geeks-diary';
            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });
    }

    private removeWindow(win: Window) {
        const idx = this.windows.findIndex(w => w === win);

        if (win === this.currentOpenWindow) {
            this.currentOpenWindow = null;
        }

        if (idx !== -1) {
            this.windows.splice(idx, 1);
        }
    }
}


export const appDelegate = new AppDelegate();
