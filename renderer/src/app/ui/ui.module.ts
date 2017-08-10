import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonComponent } from './button/button.component';
import { IconComponent } from './icon/icon.component';
import { CalendarTable, calendarTableFactory } from './calendar/calendar-table';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { ToolBar, toolBarFactory } from './tool-bar/tool-bar'


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        ButtonComponent,
        IconComponent,
        ToolBarComponent
    ],
    providers: [
        {
            provide: CalendarTable,
            useFactory() {
                return calendarTableFactory;
            },
            deps: []
        },
        {
            provide: ToolBar,
            useFactory() {
                return toolBarFactory
            },
            deps: []
        }
    ],
    exports: [
        ButtonComponent,
        IconComponent,
        ToolBarComponent
    ]
})
export class UIModule {
}
