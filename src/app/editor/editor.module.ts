import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { StackModule } from '../stack/stack.module';
import { EditorComponent } from './editor.component';
import { EditorService } from './editor.service';
import { EditorEffects } from './effects';
import { editorReducerMap } from './reducers';
import { EditorCodeSnippetComponent } from './snippet/code-snippet.component';
import { EditorSnippetFactory } from './snippet/snippet-factory';
import { EditorTextSnippetComponent } from './snippet/text-snippet.component';


@NgModule({
    imports: [
        SharedModule,
        StackModule,
        StoreModule.forFeature('editor', editorReducerMap),
        EffectsModule.forFeature([EditorEffects]),
    ],
    declarations: [
        EditorCodeSnippetComponent,
        EditorTextSnippetComponent,
        EditorComponent,
    ],
    entryComponents: [
        EditorCodeSnippetComponent,
        EditorTextSnippetComponent,
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
