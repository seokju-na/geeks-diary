import { Component, Inject, Injector, OnInit, Optional } from '@angular/core';
import { __DARWIN__ } from '../../../libs/platform';
import { DIALOG_DATA, DialogRef } from '../../ui/dialog';
import { TabControl } from '../../ui/tabs/tab-control';
import { SettingsContext } from '../settings-context';
import { SettingsRegistry } from '../settings-registry';
import { SettingsDialogData } from './settings-dialog-data';


@Component({
    selector: 'gd-settings-dialog',
    templateUrl: './settings-dialog.component.html',
    styleUrls: ['./settings-dialog.component.scss'],
})
export class SettingsDialogComponent implements OnInit {
    readonly title = __DARWIN__ ? 'Preferences' : 'Settings';
    readonly settingContexts: SettingsContext<any>[];
    readonly tabControl: TabControl;

    constructor(
        public _injector: Injector,
        @Optional() @Inject(DIALOG_DATA) public data: SettingsDialogData,
        private registry: SettingsRegistry,
        private dialogRef: DialogRef<SettingsDialogComponent, void>,
    ) {
        this.settingContexts = this.registry.getSettings();
        this.tabControl = new TabControl(this.settingContexts.map(context => ({
            id: context.id,
            name: context.tabName,
            value: context.id,
        })));
    }

    ngOnInit(): void {
        if (this.data && this.data.initialSettingId) {
            this.tabControl.selectTabByValue(this.data.initialSettingId);
        } else {
            this.tabControl.selectFirstTab();
        }
    }

    closeThisDialog(): void {
        this.dialogRef.close();
    }
}
