import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NoteCollectionModule } from './note-collection';
import { NoteEditorModule, NoteEditorService } from './note-editor';


@NgModule({
    imports: [
        CommonModule,
        NoteEditorModule,
        NoteCollectionModule,
    ],
    declarations: [],
    providers: [
        NoteEditorService,
    ],
    exports: [
        NoteEditorModule,
        NoteCollectionModule,
    ],
})
export class NoteModule {
}
