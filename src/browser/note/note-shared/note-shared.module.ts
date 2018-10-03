import { NgModule } from '@angular/core';
import { NoteParser } from './note-parser';


@NgModule({
    providers: [
        NoteParser,
    ],
})
export class NoteSharedModule {
}
