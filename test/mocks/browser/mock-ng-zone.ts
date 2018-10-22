/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { EventEmitter, Injectable, NgZone, Provider } from '@angular/core';


/**
 * Mock synchronous NgZone implementation that can be used
 * to flush out `onStable` subscriptions in tests.
 *
 * via: https://github.com/angular/angular/blob/master/packages/core/testing/src/ng_zone_mock.ts
 */
@Injectable()
export class MockNgZone extends NgZone {
    static providers(): Provider[] {
        return [
            { provide: NgZone, useClass: MockNgZone },
        ];
    }

    onStable: EventEmitter<any> = new EventEmitter(false);

    constructor() {
        super({ enableLongStackTrace: false });
    }

    run(fn: Function): any {
        return fn();
    }

    runOutsideAngular(fn: Function): any {
        return fn();
    }

    simulateZoneExit(): void {
        this.onStable.emit(null);
    }
}
