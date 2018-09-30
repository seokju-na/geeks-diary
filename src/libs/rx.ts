import { NgZone } from '@angular/core';
import { Observable, OperatorFunction } from 'rxjs';


export function toPromise<T = any>(observable: Observable<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        let result: T;

        observable.subscribe(
            value => result = value,
            error => reject(error),
            () => resolve(result),
        );
    });
}


export function enterZone<T = any>(zone: NgZone): OperatorFunction<T, T> {
    return (source: Observable<T>) =>
        new Observable<T>((observer) => {
            return source.subscribe({
                next(value: T) {
                    zone.run(() => {
                        observer.next(value);
                    });
                },
                error(error) {
                    zone.run(() => {
                        observer.error(error);
                    });
                },
                complete() {
                    zone.run(() => {
                        observer.complete();
                    });
                },
            });
        });
}
