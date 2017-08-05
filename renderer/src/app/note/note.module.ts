import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NoteStore } from './note-store.service';
import { OrderNotePipe } from './order-note.pipe';
import { NoteEditorComponent } from './editor/editor.component';
import { NoteFinderComponent } from './finder/finder.component';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        OrderNotePipe,
        NoteEditorComponent,
        NoteFinderComponent
    ],
    providers: [
        NoteStore
    ],
    exports: [
        NoteEditorComponent,
        NoteFinderComponent
    ]
})
export class NoteModule {
}
