import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle } from '@angular/platform-browser';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { getVcsFileChangeColor, getVcsFileChangeStatusIcon, VcsFileChangeStatusTypes } from '../../../../core/vcs';
import { MenuEvent, MenuService } from '../../../shared';
import { Dialog } from '../../../ui/dialog';
import { VcsCommitDialogComponent, VcsCommitDialogData, VcsCommitDialogResult } from '../../../vcs/vcs-local';
import { NoteCollectionService, NoteCollectionState, NoteItem } from '../../note-collection';
import { NoteStateWithRoot } from '../../note.state';
import { NoteEditorViewModeMenu } from '../note-editor-view-mode-menu';
import { ChangeViewModeAction } from '../note-editor.actions';
import { NoteEditorViewModes } from '../note-editor.state';


@Component({
    selector: 'gd-note-header',
    templateUrl: './note-header.component.html',
    styleUrls: ['./note-header.component.scss'],
})
export class NoteHeaderComponent implements OnInit, OnDestroy {
    get noteSelectionExists(): boolean {
        return !!this.selectedNote;
    }

    get canCommit(): boolean {
        return this.status !== null;
    }

    get status(): VcsFileChangeStatusTypes | null {
        if (this.selectedNote) {
            return this.collection.getNoteVcsFileChangeStatus(this.selectedNote);
        } else {
            return null;
        }
    }

    get statusBarColor(): SafeStyle {
        if (this.status) {
            return this.sanitizer.bypassSecurityTrustStyle(`${getVcsFileChangeColor(this.status)}`);
        } else {
            return '';
        }
    }

    get statusIcon(): SafeHtml {
        if (this.status) {
            return this.sanitizer.bypassSecurityTrustHtml(getVcsFileChangeStatusIcon(this.status));
        } else {
            return '';
        }
    }

    selectedNote: NoteItem | null = null;

    private selectedNoteSubscription = Subscription.EMPTY;
    private menuEventSubscription = Subscription.EMPTY;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private editorViewModeMenu: NoteEditorViewModeMenu,
        private collection: NoteCollectionService,
        private menu: MenuService,
        private dialog: Dialog,
        private sanitizer: DomSanitizer,
    ) {
    }

    ngOnInit(): void {
        this.selectedNoteSubscription = this.store.pipe(
            select(state => state.note.collection),
        ).subscribe((noteCollectionState: NoteCollectionState) => {
            this.selectedNote = noteCollectionState.selectedNote || null;
        });

        this.menuEventSubscription = this.menu.onMessage().pipe(
            filter(event => [
                MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_PREVIEW_ONLY,
                MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_EDITOR_ONLY,
                MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_SHOW_BOTH,
                MenuEvent.COMMIT_NOTE,
            ].includes(event)),
        ).subscribe((menuEvent) => {
            let viewMode: NoteEditorViewModes;

            switch (menuEvent) {
                case MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_SHOW_BOTH:
                    viewMode = NoteEditorViewModes.SHOW_BOTH;
                    break;
                case MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_EDITOR_ONLY:
                    viewMode = NoteEditorViewModes.EDITOR_ONLY;
                    break;
                case MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_PREVIEW_ONLY:
                    viewMode = NoteEditorViewModes.PREVIEW_ONLY;
                    break;
                case MenuEvent.COMMIT_NOTE:
                    this.openCommitDialog();
                    return;
                default:
                    return;
            }

            this.store.dispatch(new ChangeViewModeAction({ viewMode }));
        });
    }

    ngOnDestroy(): void {
        this.selectedNoteSubscription.unsubscribe();
        this.menuEventSubscription.unsubscribe();
    }

    openCommitDialog(): void {
        if (!this.canCommit) {
            return;
        }

        const fileChanges = this.collection.getNoteVcsFileChanges(this.selectedNote);

        this.dialog.open<VcsCommitDialogComponent,
            VcsCommitDialogData,
            VcsCommitDialogResult>(
            VcsCommitDialogComponent,
            {
                width: '700px',
                maxHeight: '75vh',
                disableBackdropClickClose: true,
                data: { fileChanges },
            },
        );
    }

    openEditorViewModeMenu(): void {
        this.editorViewModeMenu.open();
    }
}
