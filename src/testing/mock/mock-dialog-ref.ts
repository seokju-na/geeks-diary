import { Observable, Subject } from 'rxjs';


export class MockDialogRef {
    private readonly _afterOpen = new Subject<void>();
    private readonly _afterClosed = new Subject<any>();
    private readonly _beforeClose = new Subject<any>();

    afterOpen(): Observable<void> {
        return this._afterOpen.asObservable();
    }

    afterClosed(): Observable<any> {
        return this._afterClosed.asObservable();
    }

    beforeClose(): Observable<any> {
        return this._beforeClose.asObservable();
    }

    close(result: any): void {
        this._beforeClose.next(result);
        this._afterClosed.next(result);
    }
}
