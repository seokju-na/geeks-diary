import { NgModule } from '@angular/core';
import { UiModule } from '../../ui/ui.module';
import { NoteSharedModule } from '../note-shared';
import { NotePreviewComponent } from './note-preview.component';


@NgModule({
    imports: [
        UiModule,
        NoteSharedModule,
    ],
    declarations: [
        NotePreviewComponent,
    ],
    providers: [],
    exports: [
        NotePreviewComponent,
    ],
})
export class NotePreviewModule {
}
