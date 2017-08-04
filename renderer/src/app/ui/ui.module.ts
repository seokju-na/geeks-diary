import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button/button.component';
import { IconComponent } from './icon/icon.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CalendarTable, calendarTableFactory } from './calendar/calendar-table';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        ButtonComponent,
        IconComponent,
        CalendarComponent
    ],
    providers: [
        {
            provide: CalendarTable,
            useFactory() {
                return calendarTableFactory;
            },
            deps: []
        },
    ],
    exports: [
        ButtonComponent,
        IconComponent,
        CalendarComponent
    ]
})
export class UIModule {
}
