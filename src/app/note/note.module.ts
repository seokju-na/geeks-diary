import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { NoteCalendarComponent } from './calendar/calendar.component';
import { NoteFinderComponent } from './finder/finder.component';
import { NoteItemComponent } from './item/item.component';
import { NoteWorkspaceComponent } from './workspace/workspace.component';


@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        NoteFinderComponent,
        NoteCalendarComponent,
        NoteItemComponent,
        NoteWorkspaceComponent,
    ],
    entryComponents: [
        NoteFinderComponent,
    ],
    providers: [],
    exports: [
        NoteFinderComponent,
        NoteWorkspaceComponent,
    ],
})
export class NoteModule {
}
