import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { Subject } from 'rxjs';
import { expectDom, fastTestSetup } from '../../../../../test/helpers';
import { MockDialog } from '../../../../../test/mocks/browser';
import { VcsFileChange } from '../../../../core/vcs';
import { MenuEvent, MenuService, SharedModule } from '../../../shared';
import { Dialog } from '../../../ui/dialog';
import { UiModule } from '../../../ui/ui.module';
import { VcsFileChangeDummy } from '../../../vcs/dummies';
import { VcsCommitDialogComponent, VcsCommitDialogData, VcsCommitDialogResult } from '../../../vcs/vcs-local';
import { DeselectNoteAction, NoteCollectionService, NoteItem, SelectNoteAction } from '../../note-collection';
import { NoteItemDummy } from '../../note-collection/dummies';
import { NoteSharedModule } from '../../note-shared';
import { noteReducerMap } from '../../note.reducer';
import { NoteStateWithRoot } from '../../note.state';
import { NoteEditorViewModeMenu } from '../note-editor-view-mode-menu';
import { ChangeViewModeAction } from '../note-editor.actions';
import { NoteEditorViewModes } from '../note-editor.state';
import { NoteHeaderComponent } from './note-header.component';


describe('browser.note.noteEditor.NoteHeaderComponent', () => {
    let fixture: ComponentFixture<NoteHeaderComponent>;
    let component: NoteHeaderComponent;

    let store: Store<NoteStateWithRoot>;
    let editorViewModeMenu: NoteEditorViewModeMenu;
    let menu: MenuService;
    let mockDialog: MockDialog;
    let collection: NoteCollectionService;

    const menuStream = new Subject<MenuEvent>();
    const vcsFileChangesStream = new Subject<VcsFileChange[]>();

    const getSelectedNoteTitleEl = (): HTMLElement =>
        (fixture.debugElement.nativeElement as HTMLElement).querySelector('#selected-note-title');

    const getToolbarEl = (): HTMLElement =>
        (fixture.debugElement.nativeElement as HTMLElement).querySelector('.NoteHeader__toolbar');

    const getChangeEditorViewModeButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('#note-change-editor-view-mode-button')).nativeElement as HTMLButtonElement;

    const getCommitButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('.NoteHeader__commitButton')).nativeElement as HTMLButtonElement;

    function ensureNoteHasStatus(
        note: NoteItem = new NoteItemDummy().create(),
        vcsFileChanges?: VcsFileChange[],
    ): { note: NoteItem, vcsFileChanges: VcsFileChange[] } {
        store.dispatch(new SelectNoteAction({ note }));

        if (!vcsFileChanges) {
            vcsFileChanges = [
                {
                    ...new VcsFileChangeDummy().create(),
                    filePath: note.contentFileName,
                    absoluteFilePath: note.contentFilePath,
                } as VcsFileChange,
            ];
        }

        vcsFileChangesStream.next(vcsFileChanges);

        return { note, vcsFileChanges };
    }

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    SharedModule,
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                    ...MockDialog.imports(),
                    NoteSharedModule,
                ],
                declarations: [
                    NoteHeaderComponent,
                ],
                providers: [
                    DatePipe,
                    NoteEditorViewModeMenu,
                    NoteCollectionService,
                    ...MockDialog.providers(),
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        store = TestBed.get(Store);
        editorViewModeMenu = TestBed.get(NoteEditorViewModeMenu);
        menu = TestBed.get(MenuService);
        mockDialog = TestBed.get(Dialog);
        collection = TestBed.get(NoteCollectionService);

        spyOn(store, 'dispatch').and.callThrough();
        spyOn(menu, 'onMessage').and.callFake(() => menuStream.asObservable());
        collection.provideVcsFileChanges(vcsFileChangesStream.asObservable());

        fixture = TestBed.createComponent(NoteHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        mockDialog.closeAll();
    });

    describe('note title', () => {
        it('should note title not exists if current selected note is not exists.', () => {
            store.dispatch(new DeselectNoteAction());
            fixture.detectChanges();

            expect(getSelectedNoteTitleEl()).toBeNull();
        });

        it('should note title exists if current selected note is exists.', () => {
            const note = new NoteItemDummy().create();

            store.dispatch(new SelectNoteAction({ note }));
            fixture.detectChanges();

            expectDom(getSelectedNoteTitleEl()).toContainText(note.title);
        });

        it('should change note title to changed selected note\'s title.', () => {
            const noteDummy = new NoteItemDummy();
            const beforeNote = noteDummy.create();
            const afterNote = noteDummy.create();

            store.dispatch(new SelectNoteAction({ note: beforeNote }));
            fixture.detectChanges();

            let titleEl = getSelectedNoteTitleEl();

            expectDom(titleEl).toContainText(beforeNote.title);
            expectDom(titleEl).not.toContainText(afterNote.title);

            store.dispatch(new SelectNoteAction({ note: afterNote }));
            fixture.detectChanges();

            titleEl = getSelectedNoteTitleEl();

            expectDom(titleEl).not.toContainText(beforeNote.title);
            expectDom(titleEl).toContainText(afterNote.title);
        });
    });

    describe('toolbar', () => {
        it('should not exists if current selected note is not exists.', () => {
            store.dispatch(new DeselectNoteAction());
            fixture.detectChanges();

            expect(getToolbarEl()).toBeNull();
        });

        it('should exists if current selected note is exists.', () => {
            store.dispatch(new SelectNoteAction({ note: new NoteItemDummy().create() }));
            fixture.detectChanges();

            expect(getToolbarEl()).not.toBeNull();
        });
    });

    describe('editor view mode', () => {
        beforeEach(() => {
            store.dispatch(new SelectNoteAction({ note: new NoteItemDummy().create() }));
            fixture.detectChanges();
        });

        it('should open editor view mode menu when click change editor view mode button.', () => {
            spyOn(editorViewModeMenu, 'open');
            getChangeEditorViewModeButtonEl().click();

            expect(editorViewModeMenu.open).toHaveBeenCalled();
        });

        it('should dispatch \'CHANGE_VIEW_MODE\' action when menu event dispatched from main-process.', () => {
            menuStream.next(MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_SHOW_BOTH);
            expect(store.dispatch).toHaveBeenCalledWith(new ChangeViewModeAction({
                viewMode: NoteEditorViewModes.SHOW_BOTH,
            }));

            menuStream.next(MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_EDITOR_ONLY);
            expect(store.dispatch).toHaveBeenCalledWith(new ChangeViewModeAction({
                viewMode: NoteEditorViewModes.EDITOR_ONLY,
            }));

            menuStream.next(MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_PREVIEW_ONLY);
            expect(store.dispatch).toHaveBeenCalledWith(new ChangeViewModeAction({
                viewMode: NoteEditorViewModes.PREVIEW_ONLY,
            }));
        });
    });

    describe('commit', () => {
        it('should commit button disabled if note has not vcs changes.', () => {
            const note = new NoteItemDummy().create();
            store.dispatch(new SelectNoteAction({ note }));

            vcsFileChangesStream.next([]);
            fixture.detectChanges();

            expectDom(getCommitButtonEl()).toBeDisabled();
        });

        it('should open commit dialog when click commit dialog if note has vcs changes.', () => {
            const { vcsFileChanges } = ensureNoteHasStatus();
            fixture.detectChanges();

            getCommitButtonEl().click();

            const commitDialogRef = mockDialog.getByComponent<VcsCommitDialogComponent,
                VcsCommitDialogData,
                VcsCommitDialogResult>(
                VcsCommitDialogComponent,
            );

            expect(commitDialogRef).toBeDefined();
            expect(commitDialogRef.config.data.fileChanges).toEqual(vcsFileChanges);
        });

        it('should call \'openCommitDialog\' when \'COMMIT_NOTE\' event dispatched.', () => {
            spyOn(component, 'openCommitDialog');

            ensureNoteHasStatus();
            fixture.detectChanges();

            menuStream.next(MenuEvent.COMMIT_NOTE);
            expect(component.openCommitDialog).toHaveBeenCalled();
        });
    });

    describe('note status', () => {
        it('should show status bar and icon if note status exists.', () => {
            const note = new NoteItemDummy().create();
            store.dispatch(new SelectNoteAction({ note }));

            ensureNoteHasStatus();
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.NoteHeader__statusBar'))).not.toBeNull();
            expect(fixture.debugElement.query(By.css('.NoteHeader__statusIcon'))).not.toBeNull();
        });
    });
});
