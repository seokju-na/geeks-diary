import { remote } from 'electron';
import { ChangeDetectionStrategy, Component, HostListener, ViewEncapsulation } from '@angular/core';
import { __DARWIN__ } from '../../../libs/platform';


@Component({
    selector: 'gd-title-bar',
    templateUrl: './title-bar.component.html',
    styleUrls: ['./title-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'TitleBar',
    },
})
export class TitleBarComponent {
    toggleWindowSize(): void {
        if (!__DARWIN__) {
            return;
        }

        const actionOnDoubleClick = remote.systemPreferences.getUserDefault(
            'AppleActionOnDoubleClick',
            'string',
        );
        const mainWindow = remote.getCurrentWindow();

        switch (actionOnDoubleClick) {
            case 'Maximize':
                if (mainWindow.isMaximized()) {
                    mainWindow.unmaximize();
                } else {
                    mainWindow.maximize();
                }
                break;
            case 'Minimize':
                mainWindow.minimize();
                break;
        }
    }

    @HostListener('dblclick')
    private handleDoubleClick(): void {
        this.toggleWindowSize();
    }
}
