import { MenuItem } from 'electron';
import { Observable, Subject } from 'rxjs';


export class MockMenuRef {
    private readonly _afterClosed = new Subject<MenuItem | null>();

    afterClosed(): Observable<MenuItem | null> {
        return this._afterClosed.asObservable();
    }

    close(result: any): void {
        this._afterClosed.next(result);
    }
}
