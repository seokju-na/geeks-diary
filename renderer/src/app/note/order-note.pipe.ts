import { Pipe, PipeTransform } from '@angular/core';
import { Note } from './note-store.service';

export enum OrderCriterion {
    Title,
    Created,
    Updated
}

export enum OrderDirection {
    Asc,
    Desc
}


@Pipe({
    name: 'orderNote'
})
export class OrderNotePipe implements PipeTransform {
    transform(notes: Note[], criterion: OrderCriterion, direction: OrderDirection): Note[] {
        let prop;
        let type;
        let dir;

        switch (criterion) {
            case OrderCriterion.Title:
                prop = 'title';
                type = 'string';
                break;
            case OrderCriterion.Created:
                prop = 'created';
                type = 'date';
                break;
            case OrderCriterion.Updated:
                prop = 'updated';
                type = 'date';
                break;
        }

        switch (direction) {
            case OrderDirection.Asc:
                dir = 1;
                break;
            case OrderDirection.Desc:
                dir = -1;
                break;
        }

        const compareFn = (a: Note, b: Note): number => {
            let val1 = a[prop];
            let val2 = b[prop];

            if (type === 'date') {
                val1 = new Date(val1).getTime();
                val2 = new Date(val2).getTime();
            }

            if (val1 > val2) {
                return 1 * dir;
            } else if (val1 < val2) {
                return -1 * dir;
            }

            return 0;
        };

        notes.sort(compareFn);

        return notes;
    }
}
