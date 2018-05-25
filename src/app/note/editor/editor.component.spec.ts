import { Component, DebugElement } from '@angular/core';
import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { typeInElement } from '../../../testing/fake-event';
import { MonacoService } from '../../core/monaco.service';
import { SharedModule } from '../../shared/shared.module';
import { StackModule } from '../../stack/stack.module';
import { InitEditorAction, UpdateTitleAction } from '../actions';
import { NoteContentDummyFactory } from '../dummies';
import { noteReducerMap, NoteStateWithRoot } from '../reducers';
import { NoteEditorComponent } from './editor.component';
import { NoteEditorService } from './editor.service';
import { NoteEditorCodeSnippetComponent } from './snippet/code-snippet.component';
import { NoteEditorSnippet } from './snippet/snippet';
import { NoteEditorSnippetFactory } from './snippet/snippet-factory';
import { NoteEditorTextSnippetComponent } from './snippet/text-snippet.component';
import { NoteEditorToolbarComponent } from './toolbar/toolbar.component';


describe('app.note.editor.NoteEditorComponent', () => {
    let fixture: ComponentFixture<NoteEditorTestComponent>;
    let component: NoteEditorTestComponent;

    let store: Store<NoteStateWithRoot>;
    let editorService: NoteEditorService;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
                    StackModule,
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                providers: [
                    MonacoService,
                    NoteEditorSnippetFactory,
                    NoteEditorService,
                ],
                declarations: [
                    NoteEditorToolbarComponent,
                    NoteEditorTextSnippetComponent,
                    NoteEditorCodeSnippetComponent,
                    NoteEditorComponent,
                    NoteEditorTestComponent,
                ],
            })
            .compileComponents();
    }));

    beforeEach(inject(
        [Store, NoteEditorService],
        (s: Store<NoteStateWithRoot>, n: NoteEditorService) => {
            store = s;
            editorService = n;
        },
    ));

    beforeEach(() => {
        spyOn(store, 'dispatch').and.callThrough();

        fixture = TestBed.createComponent(NoteEditorTestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should display toolbar after editor initialized.', () => {
        const content = new NoteContentDummyFactory().create();

        store.dispatch(new InitEditorAction({ content }));
        fixture.detectChanges();

        const toolbar = fixture.debugElement.query(By.css('.NoteEditor__toolbar'));

        expect(toolbar).not.toBeNull();
    });

    it('should display title editor after editor initialized.', () => {
        const content = new NoteContentDummyFactory().create();

        store.dispatch(new InitEditorAction({ content }));
        fixture.detectChanges();

        const titleEditor = fixture.debugElement.query(By.css('.NoteEditor__titleEditor'));
        const textareaEl = titleEditor.query(By.css('textarea')).nativeElement;

        expect(textareaEl.value).toContain(content.title);
    });

    it('should dispatch \'UPDATE_TITLE\' action when title value changed.', () => {
        // Initialize editor
        const content = new NoteContentDummyFactory().create();

        store.dispatch(new InitEditorAction({ content }));
        fixture.detectChanges();

        const titleEditor = fixture.debugElement.query(By.css('.NoteEditor__titleEditor'));
        const textareaEl = titleEditor.query(By.css('textarea')).nativeElement;

        typeInElement('Some new title', textareaEl);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(new UpdateTitleAction({
            title: 'Some new title',
        }));
    });

    it('should display snippets after editor initialized.', () => {
        const content = new NoteContentDummyFactory().create();

        store.dispatch(new InitEditorAction({ content }));
        fixture.detectChanges();

        const snippets = fixture.debugElement.queryAll(By.css('.NoteEditor__snippet'));

        snippets.forEach((snippet, index) => {
            let snippetEl: DebugElement;

            switch (content.snippets[index].type) {
                case 'text':
                    snippetEl = snippet.query(By.directive(NoteEditorTextSnippetComponent));
                    break;
                case 'code':
                    snippetEl = snippet.query(By.directive(NoteEditorCodeSnippetComponent));
                    break;
            }

            expect(snippetEl).not.toBeNull();

            const instance = <NoteEditorSnippet>snippetEl.componentInstance;

            expect(instance.getValue()).toEqual(content.snippets[index].value);
        });
    });

    it('should update layouts when event dispatched.', fakeAsync(() => {
        spyOn(editorService, 'updateLayout');

        component._layoutUpdated.next();
        tick();

        expect(editorService.updateLayout).toHaveBeenCalled();
    }));
});


@Component({
    template: `
        <gd-note-editor [layoutUpdated]="layoutUpdated"></gd-note-editor>
    `,
})
class NoteEditorTestComponent {
    readonly _layoutUpdated = new Subject<void>();

    get layoutUpdated(): Observable<void> {
        return this._layoutUpdated.asObservable();
    }
}
