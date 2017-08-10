import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';


@Component({
    selector: 'app-note-finder',
    templateUrl: './finder.component.html',
    styleUrls: ['./finder.component.less']
})
export class NoteFinderComponent implements OnInit {
    indexDate: Moment;

    constructor() {
    }

    ngOnInit() {
        this.indexDate = moment();
    }

    canMoveDateIndex(direction: number): boolean {
        const now = moment();

        if (this.indexDate.year() === now.year()
            && this.indexDate.month() === now.month()) {
            if (direction === 1) {
                return false;
            }
        }

        return true;
    }

    moveDateIndexTo(direction: number) {
        if (!this.canMoveDateIndex(direction)) {
            return;
        }

        if (direction === 1) {
            this.indexDate.add(1, 'month');
        } else if (direction === -1) {
            this.indexDate.subtract(1, 'month');
        }
    }

}
