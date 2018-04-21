import { Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';


export class MockActions extends Actions {
    static providersForTesting = [
        { provide: Actions, useFactory: getActions },
    ];

    constructor() {
        super(empty());
    }

    set stream(source: Observable<any>) {
        this.source = source;
    }
}


function getActions() {
    return new MockActions();
}
