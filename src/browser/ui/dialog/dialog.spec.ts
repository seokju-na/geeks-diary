import { ESCAPE } from '@angular/cdk/keycodes';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Inject, NgModule, Optional } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchKeyboardEvent, fastTestSetup } from '../../../../test/helpers';
import { Dialog } from './dialog';
import { DIALOG_DATA } from './dialog-injectors';
import { DialogRef } from './dialog-ref';
import { DialogModule } from './dialog.module';


describe('browser.ui.dialog', () => {
    let fixture: ComponentFixture<HostDialogComponent>;

    let dialog: Dialog;
    let overlayContainerElement: HTMLElement;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    TestDialogModule,
                ],
                providers: [
                    {
                        provide: OverlayContainer,
                        useFactory: () => {
                            overlayContainerElement = document.createElement('div');
                            return { getContainerElement: () => overlayContainerElement };
                        },
                    },
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        dialog = TestBed.get(Dialog);
        fixture = TestBed.createComponent(HostDialogComponent);
        fixture.detectChanges();
    });

    it('should open dialog with component.', () => {
        const dialogRef = dialog.open<DialogComponent, { name: string }, any>(
            DialogComponent, {
                data: { name: 'seokju-na' },
            },
        );

        fixture.detectChanges();

        expect(overlayContainerElement.textContent).toContain('seokju-na');
        // noinspection SuspiciousInstanceOfGuard
        expect(dialogRef.componentInstance instanceof DialogComponent).toBe(true);
        expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);

        fixture.detectChanges();

        const dialogContainerElement = overlayContainerElement.querySelector('gd-dialog-container');
        expect(dialogContainerElement.getAttribute('role')).toBe('dialog');
    });

    it('should receive result', fakeAsync(() => {
        const dialogRef = dialog.open<DialogComponent, { name: string }, string>(DialogComponent);
        const afterClosedCallback = jasmine.createSpy('after closed callback');

        fixture.detectChanges();

        const subscription = dialogRef.afterClosed().subscribe(afterClosedCallback);
        dialogRef.close('Ok');

        fixture.detectChanges();
        flush();

        expect(afterClosedCallback).toHaveBeenCalledWith('Ok');
        expect(overlayContainerElement.querySelector('gd-dialog-container')).toBeNull();

        subscription.unsubscribe();
    }));

    it('should close dialog when press \'ESC\' key.', fakeAsync(() => {
        dialog.open<DialogComponent>(DialogComponent, {
            disableEscapeKeyDownClose: false,
        });

        fixture.detectChanges();
        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

        fixture.detectChanges();
        flush();

        expect(overlayContainerElement.querySelector('gd-dialog-container')).toBeNull();
    }));

    it('should close dialog when click backdrop.', fakeAsync(() => {
        dialog.open<DialogComponent>(DialogComponent, {
            disableBackdropClickClose: false,
            hasBackdrop: true,
        });
        fixture.detectChanges();

        const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
        backdrop.click();

        fixture.detectChanges();
        flush();

        expect(overlayContainerElement.querySelector('gd-dialog-container')).toBeNull();
    }));

});


@Component({
    template: '',
})
class HostDialogComponent {
}


@Component({
    template: `
        <p>Hello, {{ data?.name }}</p>
    `,
})
class DialogComponent {
    constructor(
        public dialogRef: DialogRef<DialogComponent>,
        @Optional() @Inject(DIALOG_DATA) public data: { name: string },
    ) {
    }
}


@NgModule({
    imports: [
        DialogModule,
        NoopAnimationsModule,
    ],
    declarations: [
        HostDialogComponent,
        DialogComponent,
    ],
    entryComponents: [
        DialogComponent,
    ],
    exports: [
        HostDialogComponent,
        DialogComponent,
    ],
})
class TestDialogModule {
}
