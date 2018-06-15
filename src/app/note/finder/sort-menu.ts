import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { switchMap, take } from 'rxjs/operators';
import { Menu } from '../../shared/menu/menu';
import { ChangeSortAction } from '../actions';
import { NoteFinderSortDirection, NoteFinderSortTypes } from '../models';
import { NoteStateWithRoot } from '../reducers';


@Injectable()
export class NoteFinderSortMenu {
    constructor(
        private store: Store<NoteStateWithRoot>,
        private menu: Menu,
    ) {
    }

    open(): void {
        this.store
            .pipe(
                select(state => state.note.finder),
                take(1),
                switchMap(finderState =>
                    this.menu
                        .open(this.buildTemplate(
                            finderState.sortBy,
                            finderState.sortDirection,
                        ))
                        .afterClosed(),
                ),
            )
            .subscribe((menuItem: any) => {
                if (menuItem) {
                    this.handleMenuItemClick(menuItem);
                }
            });
    }

    private buildTemplate(
        sortBy: NoteFinderSortTypes,
        direction: NoteFinderSortDirection,
    ): Electron.MenuItemConstructorOptions[] {

        const template: Electron.MenuItemConstructorOptions[] = [
            {
                id: NoteFinderSortTypes.CREATED,
                type: 'checkbox',
                label: 'Date Created',
            },
            {
                id: NoteFinderSortTypes.UPDATED,
                type: 'checkbox',
                label: 'Date Updated',
            },
            {
                id: NoteFinderSortTypes.TITLE,
                type: 'checkbox',
                label: 'Title',
            },
            { type: 'separator' },
            {
                id: NoteFinderSortDirection.DESC,
                type: 'checkbox',
                label: 'Desc',
            },
            {
                id: NoteFinderSortDirection.ASC,
                type: 'checkbox',
                label: 'Asc',
            },
        ];

        template.forEach((item) => {
            item.checked = item.id === sortBy || item.id === direction;
        });

        return template;
    }

    private handleMenuItemClick(menuItem: any): void {
        const id = menuItem.id;
        let action: ChangeSortAction;

        if (id === NoteFinderSortTypes.CREATED
            || id === NoteFinderSortTypes.UPDATED
            || id === NoteFinderSortTypes.TITLE) {

            action = new ChangeSortAction({ sortBy: id });
        }

        if (id === NoteFinderSortDirection.DESC
            || id === NoteFinderSortDirection.ASC) {

            action = new ChangeSortAction({ sortDirection: id });
        }

        this.store.dispatch(action);
    }
}
