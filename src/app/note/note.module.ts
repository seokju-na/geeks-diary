import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { StackModule } from '../stack/stack.module';
import { NoteCalendarComponent } from './calendar/calendar.component';
import { NoteEditorComponent } from './editor/editor.component';
import { NoteFinderComponent } from './finder/finder.component';
import { NoteHeaderComponent } from './header/header.component';
import { NoteItemComponent } from './item/item.component';
import { NotePreviewComponent } from './preview/preview.component';
import { NoteWorkspaceComponent } from './workspace/workspace.component';


@NgModule({
    imports: [
        SharedModule,
        StackModule,
    ],
    declarations: [
        NoteFinderComponent,
        NoteCalendarComponent,
        NoteItemComponent,
        NoteWorkspaceComponent,
        NoteHeaderComponent,
        NotePreviewComponent,
        NoteEditorComponent,
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
