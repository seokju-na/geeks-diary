import { Type } from '@angular/core/src/type';


export interface AppService {
    id: string;
    name: string;
    shortcut: string;
    iconName: string;
    description: string;
    outletComponent: Type<any>;
}
