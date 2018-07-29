import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ChangeViewModeAction } from '../shared/note-collection.actions';
import { NoteCollectionViewModes } from '../shared/note-collection.state';
import { NoteStateWithRoot } from '../shared/note.state';
import { NoteListSortingMenu } from './note-list-sorting-menu';


@Component({
    selector: 'gd-note-list-tools',
    templateUrl: './note-list-tools.component.html',
    styleUrls: ['./note-list-tools.component.scss'],
    providers: [NoteListSortingMenu],
})
export class NoteListToolsComponent implements OnInit, OnDestroy {
    readonly viewModeOptions = [
        {
            name: 'viewDetail',
            value: NoteCollectionViewModes.VIEW_DETAIL,
            iconName: 'reorder',
        },
        {
            name: 'viewSimple',
            value: NoteCollectionViewModes.VIEW_SIMPLE,
            iconName: 'align-justify',
        },
    ];

    viewModeControl = new FormControl(this.viewModeOptions[0].value);

    private viewModeChangeSubscription = Subscription.EMPTY;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private sortingMenu: NoteListSortingMenu,
    ) {
    }

    ngOnInit(): void {
        this.viewModeChangeSubscription =
            this.viewModeControl.valueChanges.subscribe((viewMode) => {
                this.store.dispatch(new ChangeViewModeAction({ viewMode }));
            });
    }

    ngOnDestroy(): void {
        this.viewModeChangeSubscription.unsubscribe();
    }

    openSortingMenu(): void {
        this.sortingMenu.open();
    }
}
