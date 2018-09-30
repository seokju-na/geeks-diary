import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NoteEditorComponent } from './note-editor.component';
import { NoteEditorService } from './note-editor.service';


@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        NoteEditorComponent,
    ],
    providers: [
        NoteEditorService,
    ],
    exports: [
        NoteEditorComponent,
    ],
})
export class NoteEditorModule {
}
