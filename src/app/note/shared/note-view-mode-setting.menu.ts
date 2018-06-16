import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { switchMap, take } from 'rxjs/operators';
import { Menu } from '../../shared/menu/menu';
import { ChangeEditorViewModeAction } from '../actions';
import { NoteEditorViewModes } from '../models';
import { NoteStateWithRoot } from '../reducers';


@Injectable()
export class NoteViewModeSettingMenu {
    constructor(
        private store: Store<NoteStateWithRoot>,
        private menu: Menu,
    ) {
    }

    open(): void {
        const getViewMode = this.store.pipe(
            select(state => state.note.editor.viewMode),
            take(1),
        );

        getViewMode
            .pipe(
                switchMap(viewMode =>
                    this.menu
                        .open(this.buildTemplate(viewMode))
                        .afterClosed(),
                ),
            )
            .subscribe((menuItem: any) => {
                if (menuItem) {
                    this.dispatchEvent(menuItem.id);
                }
            });
    }

    private buildTemplate(
        viewMode: NoteEditorViewModes,
    ): Electron.MenuItemConstructorOptions[] {

        const template: Electron.MenuItemConstructorOptions[] = [
            { id: NoteEditorViewModes.SHOW_BOTH, type: 'checkbox', label: 'Show Both' },
            { id: NoteEditorViewModes.EDITOR_ONLY, type: 'checkbox', label: 'Editor Only' },
            { id: NoteEditorViewModes.PREVIEW_ONLY, type: 'checkbox', label: 'Preview Only' },
        ];

        template.forEach((item) => {
            item.checked = item.id === viewMode;
        });

        return template;
    }

    private dispatchEvent(viewMode: NoteEditorViewModes): void {
        const action = new ChangeEditorViewModeAction({ viewMode });

        this.store.dispatch(action);
    }
}
