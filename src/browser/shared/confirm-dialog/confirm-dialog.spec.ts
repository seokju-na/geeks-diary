import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { expectDom, fastTestSetup } from '../../../../test/helpers';
import { MockDialog, MockDialogRef } from '../../../../test/mocks/browser';
import { DialogRef } from '../../ui/dialog';
import { UiModule } from '../../ui/ui.module';
import { ConfirmDialogData } from './confirm-dialog-data';
import { ConfirmDialogComponent } from './confirm-dialog.component';


describe('browser.shared.confirmDialog', () => {
    let fixture: ComponentFixture<ConfirmDialogComponent>;
    let component: ConfirmDialogComponent;

    let mockDialog: MockDialog;
    let mockDialogRef: MockDialogRef<ConfirmDialogComponent,
        ConfirmDialogData,
        boolean>;

    fastTestSetup();

    beforeAll(async () => {
        mockDialog = new MockDialog();
        mockDialogRef = new MockDialogRef(
            mockDialog,
            ConfirmDialogComponent,
        );

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                ],
                providers: [
                    { provide: DialogRef, useValue: mockDialogRef },
                ],
                declarations: [
                    ConfirmDialogComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmDialogComponent);
        component = fixture.componentInstance;
    });

    describe('alert', () => {
        beforeEach(() => {
            component.data = {
                isAlert: true,
                title: 'Alert Title',
                body: 'Alert Content',
                alertButtonString: 'Alert Button String',
            };
            fixture.detectChanges();
        });

        it('should warning icon exists in header when title exists.', () => {
            expect(fixture.debugElement.query(By.css('gd-dialog-header > gd-icon'))).not.toBeNull();
        });

        it('should title displayed when title exists.', () => {
            expectDom(
                fixture.debugElement.query(By.css('h1[gdDialogTitle]')).nativeElement as HTMLElement,
            ).toContainText('Alert Title');
        });

        it('should content display with body.', () => {
            expectDom(
                fixture.debugElement.query(By.css('gd-dialog-content')).nativeElement as HTMLElement,
            ).toContainText('Alert Content');
        });

        it('should button exists only one.', () => {
            expect(fixture.debugElement.queryAll(By.css('gd-dialog-actions > button')).length).toEqual(1);
        });

        it('should button string set with given string.', () => {
            expectDom(fixture.debugElement.query(
                By.css('gd-dialog-actions > button:first-child'),
            ).nativeElement as HTMLButtonElement).toContainText('Alert Button String');
        });

        it('should close dialog with \'undefined\' when click action button.', () => {
            const closeCallback = jasmine.createSpy('dialog close callback');
            const subscription = mockDialogRef.afterClosed().subscribe(closeCallback);

            (fixture.debugElement.query(
                By.css('gd-dialog-actions > button:first-child'),
            ).nativeElement as HTMLButtonElement).click();

            expect(closeCallback).toHaveBeenCalledWith(undefined);
            subscription.unsubscribe();
        });
    });

    describe('confirm', () => {
        beforeEach(() => {
            component.data = {
                isAlert: false,
                title: 'Title',
                body: 'Content',
                confirmButtonString: 'Confirm',
                cancelButtonString: 'Cancel',
            };
            fixture.detectChanges();
        });

        it('should title displayed when title exists.', () => {
            expectDom(
                fixture.debugElement.query(By.css('h1[gdDialogTitle]')).nativeElement as HTMLElement,
            ).toContainText('Title');
        });

        it('should content display with body.', () => {
            expectDom(
                fixture.debugElement.query(By.css('gd-dialog-content')).nativeElement as HTMLElement,
            ).toContainText('Content');
        });

        it('should button exists only two. Confirm button and cancel button.', () => {
            expect(fixture.debugElement.queryAll(By.css('gd-dialog-actions > button')).length).toEqual(2);
        });

        it('should button string set with given string.', () => {
            expectDom(fixture.debugElement.query(
                By.css('gd-dialog-actions > button:first-child'),
            ).nativeElement as HTMLButtonElement).toContainText('Cancel');

            expectDom(fixture.debugElement.query(
                By.css('gd-dialog-actions > button:last-child'),
            ).nativeElement as HTMLButtonElement).toContainText('Confirm');
        });

        it('should close dialog with \'false\' when click cancel button.', () => {
            const closeCallback = jasmine.createSpy('dialog close callback');
            const subscription = mockDialogRef.afterClosed().subscribe(closeCallback);

            (fixture.debugElement.query(
                By.css('gd-dialog-actions > button:first-child'),
            ).nativeElement as HTMLButtonElement).click();

            expect(closeCallback).toHaveBeenCalledWith(false);
            subscription.unsubscribe();
        });

        it('should close dialog with \'true\' when click confirm button.', () => {
            const closeCallback = jasmine.createSpy('dialog close callback');
            const subscription = mockDialogRef.afterClosed().subscribe(closeCallback);

            (fixture.debugElement.query(
                By.css('gd-dialog-actions > button:last-child'),
            ).nativeElement as HTMLButtonElement).click();

            expect(closeCallback).toHaveBeenCalledWith(true);
            subscription.unsubscribe();
        });
    });
});
