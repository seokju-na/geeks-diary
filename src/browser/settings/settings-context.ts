import { Type } from '@angular/core';


export class SettingsContext<T> {
    id: string;
    tabName: string;
    component: Type<T>;
}
