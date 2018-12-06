import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { MenuItemConstructorOptions } from 'electron';
import { switchMap, take } from 'rxjs/operators';
import { __DARWIN__ } from '../../../libs/platform';
import { NativeMenu } from '../../ui/menu';
import { NoteStateWithRoot } from '../note.state';
import { ChangeViewModeAction } from './note-editor.actions';
import { NoteEditorState, NoteEditorViewModes } from './note-editor.state';


@Injectable()
export class NoteEditorViewModeMenu {
    constructor(
        private store: Store<NoteStateWithRoot>,
        private nativeMenu: NativeMenu,
    ) {
    }

    open(): void {
        this.store.pipe(
            select(state => state.note.editor),
            take(1),
            switchMap(state => this.nativeMenu
                .open(this.buildTemplate(state))
                .afterClosed(),
            ),
        ).subscribe((item) => {
            if (item) {
                this.handleMenuItemClick(item.id);
            }
        });
    }

    private buildTemplate(state: NoteEditorState): MenuItemConstructorOptions[] {
        const template: MenuItemConstructorOptions[] = [
            {
                id: NoteEditorViewModes.EDITOR_ONLY,
                type: 'checkbox',
                label: __DARWIN__ ? 'Editor Only' : 'Editor only',
            },
            {
                id: NoteEditorViewModes.PREVIEW_ONLY,
                type: 'checkbox',
                label: __DARWIN__ ? 'Preview Only' : 'Preview only',
            },
            {
                id: NoteEditorViewModes.SHOW_BOTH,
                type: 'checkbox',
                label: __DARWIN__ ? 'Show Both' : 'Show both',
            },
        ];

        template.forEach((item) => {
            item.checked = item.id === state.viewMode;
        });

        return template;
    }

    private handleMenuItemClick(id: string): void {
        this.store.dispatch(new ChangeViewModeAction({ viewMode: id as NoteEditorViewModes }));
    }
}
