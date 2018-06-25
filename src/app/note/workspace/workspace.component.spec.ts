import { DebugElement } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { MockFsService } from '../../../testing/mock';
import { expectDebugElement } from '../../../testing/validation';
import { MonacoService } from '../../core/monaco.service';
import { SharedModule } from '../../shared/shared.module';
import { StackModule } from '../../stack/stack.module';
import { ChangeEditorViewModeAction, DeselectNoteAction, InitEditorAction } from '../actions';
import { NoteContentDummyFactory } from '../dummies';
import { NoteEditorComponent } from '../editor/editor.component';
import { NoteEditorService } from '../editor/editor.service';
import { NoteEditorCodeSnippetComponent } from '../editor/snippet/code-snippet.component';
import { NoteEditorSnippetFactory } from '../editor/snippet/snippet-factory';
import { NoteEditorTextSnippetComponent } from '../editor/snippet/text-snippet.component';
import { NoteEditorToolbarComponent } from '../editor/toolbar/toolbar.component';
import { NoteHeaderComponent } from '../header/header.component';
import { NoteEditorViewModes } from '../models';
import { NotePreviewLanguageChartComponent } from '../preview/language-chart.component';
import { NotePreviewComponent } from '../preview/preview.component';
import { noteReducerMap, NoteStateWithRoot } from '../reducers';
import { NoteFsService } from '../shared/note-fs.service';
import { NoteProduceService } from '../shared/note-produce.service';
import { NoteViewModeSettingMenu } from '../shared/note-view-mode-setting.menu';
import { NoteWorkspaceComponent } from './workspace.component';


describe('app.note.workspace.NoteWorkspaceComponent', () => {
    let fixture: ComponentFixture<NoteWorkspaceComponent>;
    let component: NoteWorkspaceComponent;

    let store: Store<NoteStateWithRoot>;

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
                    ...MockFsService.providersForTesting,
                    MonacoService,
                    NoteEditorSnippetFactory,
                    NoteEditorService,
                    NoteFsService,
                    NoteProduceService,
                    NoteViewModeSettingMenu,
                ],
                declarations: [
                    NoteHeaderComponent,
                    NoteEditorCodeSnippetComponent,
                    NoteEditorTextSnippetComponent,
                    NoteEditorToolbarComponent,
                    NoteEditorComponent,
                    NotePreviewComponent,
                    NotePreviewLanguageChartComponent,
                    NoteWorkspaceComponent,
                ],
            })
            .compileComponents();
    }));

    beforeEach(inject(
        [Store],
        (s: Store<NoteStateWithRoot>) => {
            store = s;
        },
    ));

    beforeEach(() => {
        fixture = TestBed.createComponent(NoteWorkspaceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should show both editor and preview when current editor view mode ' +
        'is \'SHOW_BOTH\'.', () => {

        const action = new ChangeEditorViewModeAction({
            viewMode: NoteEditorViewModes.SHOW_BOTH,
        });

        store.dispatch(action);
        fixture.detectChanges();

        const editorPanel = fixture.debugElement.query(By.css('.NoteWorkspace__panel--editor'));
        const previewPanel = fixture.debugElement.query(By.css('.NoteWorkspace__panel--preview'));

        expectDebugElement(editorPanel).toBeDisplayed();
        expectDebugElement(previewPanel).toBeDisplayed();
    });

    it('should show only editor when current editor view mode ' +
        'is \'EDITOR_ONLY\'.', () => {

        const action = new ChangeEditorViewModeAction({
            viewMode: NoteEditorViewModes.EDITOR_ONLY,
        });

        store.dispatch(action);
        fixture.detectChanges();

        const editorPanel = fixture.debugElement.query(By.css('.NoteWorkspace__panel--editor'));
        const previewPanel = fixture.debugElement.query(By.css('.NoteWorkspace__panel--preview'));

        expectDebugElement(editorPanel).toBeDisplayed();
        expectDebugElement(previewPanel).not.toBeDisplayed();
    });

    it('should show only preview when current editor view mode ' +
        'is \'PREVIEW_ONLY\'.', () => {

        const action = new ChangeEditorViewModeAction({
            viewMode: NoteEditorViewModes.PREVIEW_ONLY,
        });

        store.dispatch(action);
        fixture.detectChanges();

        const editorPanel = fixture.debugElement.query(By.css('.NoteWorkspace__panel--editor'));
        const previewPanel = fixture.debugElement.query(By.css('.NoteWorkspace__panel--preview'));

        expectDebugElement(editorPanel).not.toBeDisplayed();
        expectDebugElement(previewPanel).toBeDisplayed();
    });

    it('should show empty state when editor not loaded.', () => {
        let emptyState: DebugElement;

        store.dispatch(new InitEditorAction({
            content: new NoteContentDummyFactory().create(),
        }));
        fixture.detectChanges();

        emptyState = fixture.debugElement.query(By.css('#noteEmptyState'));
        expect(emptyState).toBeNull();

        store.dispatch(new DeselectNoteAction());
        fixture.detectChanges();

        emptyState = fixture.debugElement.query(By.css('#noteEmptyState'));
        expect(emptyState).not.toBeNull();
    });
});
