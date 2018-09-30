import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { remote } from 'electron';
import { Themes } from './color-and-theme';


const { systemPreferences } = remote;


@Injectable()
export class ThemeService {
    static readonly defaultTheme = systemPreferences.isDarkMode()
        ? Themes.BASIC_DARK_THEME
        : Themes.BASIC_LIGHT_THEME;

    constructor(@Inject(DOCUMENT) private document: any) {
    }

    private _currentTheme: Themes | null = null;

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
