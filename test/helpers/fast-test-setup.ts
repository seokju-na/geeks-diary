import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';


/**
 * Sources from:
 *  https://github.com/topnotch48/ng-bullet-workspace
 *  https://blog.angularindepth.com/angular-unit-testing-performance-34363b7345ba
 *
 * @example
 * describe('Testing Something.', () => {
 *     fastTestSetup();
 *
 *     let fixture: ComponentFixture<SomethingComponent>;
 *
 *     beforeAll(async () => {
 *         await TestBed.configureTestingModule({
 *             declarations: [SomethingComponent],
 *         })
 *         .compileComponents();
 *     });
 *
 *     it('...');
 * });
 */
export function fastTestSetup(): void {
    const testBedApi: any = getTestBed();
    const originReset = TestBed.resetTestingModule;

    beforeAll(() => {
        TestBed.resetTestingModule();
        TestBed.resetTestingModule = () => TestBed;
    });

    afterEach(() => {
        testBedApi._activeFixtures.forEach((fixture: ComponentFixture<any>) => fixture.destroy());
        testBedApi._instantiated = false;
    });

    afterAll(() => {
        TestBed.resetTestingModule = originReset;
        TestBed.resetTestingModule();
    });
}
