import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';


export enum Themes {
    BASIC_LIGHT_THEME = 'BasicLightTheme',
    BASIC_DARK_THEME = 'BasicDarkTheme',
}


@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private _currentTheme: Themes | null = null;

    constructor(@Inject(DOCUMENT) private document: any) {
    }

    get currentTheme(): Themes | null {
        return this._currentTheme;
    }

    setTheme(theme: Themes): void {
        const elem: HTMLElement = this.document.getElementsByTagName('html')[0];

        if (this._currentTheme && elem.classList.contains(this._currentTheme)) {
            elem.classList.remove(this._currentTheme);
        }

        this._currentTheme = theme;
        elem.classList.add(this._currentTheme);
    }
}
