import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../shared';
import { Themes } from '../../../ui/style';


@Component({
    selector: 'gd-general-settings',
    templateUrl: './general-settings.component.html',
    styleUrls: ['./general-settings.component.scss'],
})
export class GeneralSettingsComponent implements OnInit, OnDestroy {
    readonly themeFormControl = new FormControl();
    readonly themeOptions = [
        { name: 'Light Theme', value: Themes.BASIC_LIGHT_THEME },
        { name: 'Dark Theme', value: Themes.BASIC_DARK_THEME },
    ];

    private themeUpdateSubscription = Subscription.EMPTY;

    constructor(private theme: ThemeService) {
    }

    ngOnInit(): void {
        this.themeFormControl.setValue(this.theme.currentTheme);
        this.themeUpdateSubscription = this.themeFormControl.valueChanges.subscribe(this.theme.setTheme);
    }

    ngOnDestroy(): void {
        this.themeUpdateSubscription.unsubscribe();
    }
}
