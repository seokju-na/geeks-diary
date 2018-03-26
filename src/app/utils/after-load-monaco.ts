import { Observable } from 'rxjs/Observable';


export function afterLoadMonaco(): Observable<any> {
    const targetWindow: any = <any>window;

    return new Observable<any>((observer) => {
        if (targetWindow.MONACO) {
            observer.next(targetWindow.MONACO);
            observer.complete();
        } else {
            targetWindow.REGISTER_MONACO_INIT_CALLBACK(() => {
                observer.next(targetWindow.MONACO);
                observer.complete();
            });
        }
    });
}
