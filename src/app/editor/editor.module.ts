import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { EditorComponent } from './editor.component';
import { EditorService } from './editor.service';
import { editorReducerMap } from './reducers';
import { EditorSnippetFactory } from './snippet/snippet-factory';


@NgModule({
    imports: [
        SharedModule,
        StoreModule.forFeature('editor', editorReducerMap),
    ],
    declarations: [
        EditorComponent,
    ],
    providers: [
        EditorSnippetFactory,
        EditorService,
    ],
    exports: [
        EditorComponent,
    ],
})
export class EditorModule {
}
