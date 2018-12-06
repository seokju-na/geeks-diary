import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MenuEvent, MenuService } from '../../../shared';
import { NoteCollectionState, NoteItem } from '../../note-collection';
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
    selectedNote: NoteItem | null = null;

    private selectedNoteSubscription = Subscription.EMPTY;
    private menuEventSubscription = Subscription.EMPTY;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private editorViewModeMenu: NoteEditorViewModeMenu,
        private menu: MenuService,
    ) {
    }

    get noteSelectionExists(): boolean {
        return !!this.selectedNote;
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

    openEditorViewModeMenu(): void {
        this.editorViewModeMenu.open();
    }
}
