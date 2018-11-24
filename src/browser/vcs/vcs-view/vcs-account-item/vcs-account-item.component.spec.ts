import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchMouseEvent, expectDom, fastTestSetup } from '../../../../../test/helpers';
import { VcsAccountDummy } from '../../../../core/dummies';
import { VcsAccount } from '../../../../core/vcs';
import { UiModule } from '../../../ui/ui.module';
import { VcsAccountItemComponent } from './vcs-account-item.component';


describe('browser.vcs.vcsAuthentication.VcsAccountItem', () => {
    let fixture: ComponentFixture<VcsAccountItemComponent>;
    let component: VcsAccountItemComponent;

    const vcsAccountDummy = new VcsAccountDummy();
    let vcsAccount: VcsAccount;

    // const getDefaultLabelEl = (): HTMLElement =>
    //     fixture.debugElement.query(By.css('.VcsAccountItem__defaultLabel')).nativeElement as HTMLElement;
    //
    // const getSetAsDefaultButtonEl = (): HTMLButtonElement =>
    //     fixture.debugElement.query(
    //         By.css('.VcsAccountItem__tools > button:nth-child(1)'),
    //     ).nativeElement as HTMLButtonElement;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                ],
                declarations: [
                    VcsAccountItemComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        vcsAccount = vcsAccountDummy.create();

        fixture = TestBed.createComponent(VcsAccountItemComponent);
        component = fixture.componentInstance;
        component.account = vcsAccount;
    });

    describe('info display', () => {
        it('should show account name and email.', () => {
            fixture.detectChanges();

            expectDom(
                fixture.debugElement.query(By.css('.VcsAccountItem__name')).nativeElement as HTMLElement,
            ).toContainText(vcsAccount.name);
            expectDom(
                fixture.debugElement.query(By.css('.VcsAccountItem__email')).nativeElement as HTMLElement,
            ).toContainText(vcsAccount.email);
        });

        // it('should show default label when account is default.', () => {
        //     component.isDefault = false;
        //     fixture.detectChanges();
        //
        //     expectDom(getDefaultLabelEl()).toBeStyled('display', 'none');
        //
        //     component.isDefault = true;
        //     fixture.detectChanges();
        //
        //     expectDom(getDefaultLabelEl()).not.toBeStyled('display', 'none');
        // });
    });

    describe('focusable option', () => {
        it('should component implements \'FocusableOption\'.', () => {
            expect((component as any).focus).toBeDefined();
        });

        it('should \'tabindex\' to be \'0\' if item activated.', () => {
            component.active = false;
            fixture.detectChanges();

            expectDom(component._elementRef.nativeElement).toHaveAttribute('tabindex', '-1');

            component.active = true;
            fixture.detectChanges();

            expectDom(component._elementRef.nativeElement).toHaveAttribute('tabindex', '0');
        });
    });

    describe('tools', () => {
        it('should show tools when \'mouseenter\' and hide tools when \'mouseleave\'.', () => {
            fixture.detectChanges();

            const elem = component._elementRef.nativeElement;
            dispatchMouseEvent(elem, 'mouseenter');
            fixture.detectChanges();

            expectDom(
                fixture.debugElement.query(By.css('.VcsAccountItem__tools')).nativeElement as HTMLElement,
            ).not.toBeStyled('display', 'none');

            dispatchMouseEvent(elem, 'mouseleave');
            fixture.detectChanges();

            expectDom(
                fixture.debugElement.query(By.css('.VcsAccountItem__tools')).nativeElement as HTMLElement,
            ).toBeStyled('display', 'none');
        });

        // it('should set as default button not exists if item is default.', () => {
        //     fixture.detectChanges();
        //
        //     expectDom(getSetAsDefaultButtonEl()).not.toBeStyled('display', 'none');
        //
        //     component.isDefault = true;
        //     fixture.detectChanges();
        //
        //     expectDom(getSetAsDefaultButtonEl()).toBeStyled('display', 'none');
        // });
        //
        // it('should emit \'setThisAsDefault\' event when click set as default button.', () => {
        //     component.active = true;
        //     component.isDefault = false;
        //     fixture.detectChanges();
        //
        //     const callback = jasmine.createSpy('setThisAsDefault callback');
        //     const subscription = component.setThisAsDefault.subscribe(callback);
        //
        //     // First button is target.
        //     getSetAsDefaultButtonEl().click();
        //     fixture.detectChanges();
        //
        //     expect(callback).toHaveBeenCalled();
        //     subscription.unsubscribe();
        // });

        it('should emit \'removeThis\' event when click remove button.', () => {
            component.active = true;
            fixture.detectChanges();

            const callback = jasmine.createSpy('removeThis callback');
            const subscription = component.removeThis.subscribe(callback);

            // Second button is target.
            const removeButtonEl = fixture.debugElement.query(
                By.css('.VcsAccountItem__tools > button:nth-child(1)'),
            ).nativeElement as HTMLButtonElement;

            removeButtonEl.click();
            fixture.detectChanges();

            expect(callback).toHaveBeenCalled();
            subscription.unsubscribe();
        });
    });
});
