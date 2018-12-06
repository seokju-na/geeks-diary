import { remote } from 'electron';


export type ColorTheme = 'normal' | 'primary' | 'warn';


export enum Themes {
    BASIC_LIGHT_THEME = 'BasicLightTheme',
    BASIC_DARK_THEME = 'BasicDarkTheme',
}


export const defaultTheme = remote.systemPreferences.isDarkMode()
    ? Themes.BASIC_DARK_THEME
    : Themes.BASIC_LIGHT_THEME;
