import { Component, OnInit } from '@angular/core';
import { NoteFinderComponent } from '../note/note-collection';
import { NoteCollectionService } from '../note/note-collection/note-collection.service';
import { AppLayoutSidenavOutlet } from './app-layout';


@Component({
    selector: 'gd-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    readonly sidenavOutlets: AppLayoutSidenavOutlet[] = [
        {
            id: 'gd-note-finder',
            name: 'Notes',
            iconName: 'folder',
            shortcut: '',
            description: 'Notes (⌘+1)',
            outletComponent: NoteFinderComponent,
        },
    ];

    constructor(private collection: NoteCollectionService) {
    }

    ngOnInit(): void {
        this.collection.load();
    }
}
