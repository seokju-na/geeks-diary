import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { remote } from 'electron';
import { __DARWIN__ } from '../../../libs/platform';


@Component({
    selector: 'gd-title-bar',
    templateUrl: './title-bar.component.html',
    styleUrls: ['./title-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TitleBarComponent implements OnInit {

    constructor() {
    }

    ngOnInit(): void {
    }

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
}
