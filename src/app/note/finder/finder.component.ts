import { Component, OnInit } from '@angular/core';
import { datetime } from '../../../common/datetime';


@Component({
    selector: 'gd-note-finder',
    templateUrl: './finder.component.html',
    styleUrls: ['./finder.component.less'],
})
export class NoteFinderComponent implements OnInit {
    indexDate: Date;

    ngOnInit(): void {
        this.indexDate = datetime.today();
    }

    updateIndexDate(distDate: Date): void {
        // Make sure change reference so that angular can detect changes.
        this.indexDate = datetime.copy(distDate);
    }
}
