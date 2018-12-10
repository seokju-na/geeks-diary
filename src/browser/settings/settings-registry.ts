import { Inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import { SettingsContext } from './settings-context';


export const SETTINGS_REGISTRATION = new InjectionToken<SettingsContext<any>[]>('SettingsRegistration');


@Injectable()
export class SettingsRegistry implements OnDestroy {
    readonly settingsMap = new Map<string, SettingsContext<any>>();

    constructor(@Inject(SETTINGS_REGISTRATION) registration: SettingsContext<any>[]) {
        registration.forEach((context) => {
            this.settingsMap.set(context.id, context);
        });
    }

    ngOnDestroy(): void {
        this.settingsMap.clear();
    }

    getSettings(): SettingsContext<any>[] {
        return [...this.settingsMap.values()];
    }
}
