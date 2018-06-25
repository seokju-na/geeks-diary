import { Injectable } from '@angular/core';
import * as path from 'path';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FsService } from './fs.service';
import { UserData } from './models';


@Injectable()
export class UserDataService {
    static readonly userDataFileName = 'user-data.json';
    readonly userDataStoragePath: string;

    constructor(private fsService: FsService) {
        this.userDataStoragePath = path.resolve(
            environment.getPath('userData'),
            UserDataService.userDataFileName,
        );
    }

    readUserData(): Observable<UserData> {
        return this.fsService.readFile(this.userDataStoragePath).pipe(
            map(buffer => JSON.parse(buffer.toString())),
            catchError(() => of({})),
        );
    }

    writeUserData(userData: UserData): Observable<void> {
        return this.fsService.writeFile(
            this.userDataStoragePath,
            JSON.stringify(userData),
        );
    }
}
