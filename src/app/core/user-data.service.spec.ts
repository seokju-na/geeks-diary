import { fakeAsync, TestBed } from '@angular/core/testing';
import { MockFsService } from '../../testing/mock';
import { UserDataDummyFactory } from './dummies';
import { FsService } from './fs.service';
import { UserDataService } from './user-data.service';


describe('UserDataService', () => {
    let userDataService: UserDataService;
    let mockFsService: MockFsService;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                providers: [
                    ...MockFsService.providersForTesting,
                    UserDataService,
                ],
            });

        userDataService = TestBed.get(UserDataService);
        mockFsService = TestBed.get(FsService);
    });

    describe('readUserData', () => {
        it('should return empty user data when error caught.', fakeAsync(() => {
            const callback = jasmine.createSpy('callback');
            const error = new Error();

            userDataService.readUserData().subscribe(callback);
            mockFsService
                .expect({
                    methodName: 'readFile',
                    args: [userDataService.userDataStoragePath, 'utf8'],
                })
                .error(error);

            expect(callback).toHaveBeenCalledWith({});
        }));

        it('should return user data after read data.', fakeAsync(() => {
            const callback = jasmine.createSpy('callback');
            const userData = new UserDataDummyFactory().create();

            userDataService.readUserData().subscribe(callback);
            mockFsService
                .expect({
                    methodName: 'readFile',
                    args: [userDataService.userDataStoragePath, 'utf8'],
                })
                .flush(Buffer.from(JSON.stringify(userData)));

            expect(callback).toHaveBeenCalledWith(userData);
        }));
    });

    describe('writeUserData', () => {
        it('should write user data.', fakeAsync(() => {
            const userData = new UserDataDummyFactory().create();

            userDataService.writeUserData(userData).subscribe();
            mockFsService
                .expect({
                    methodName: 'writeFile',
                    args: [
                        userDataService.userDataStoragePath,
                        JSON.stringify(userData),
                        'utf8',
                    ],
                })
                .flush();
        }));
    });
});
