import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteStore } from './note-store.service';
import { OrderNotePipe } from './order-note.pipe';
import { NoteEditorComponent } from './editor/editor.component';
import { FinderComponent } from './finder/finder.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        OrderNotePipe,
        NoteEditorComponent,
        FinderComponent
    ],
    providers: [
        NoteStore
    ],
    exports: [
        NoteEditorComponent,
        FinderComponent
    ]
})
export class NoteModule {
}
