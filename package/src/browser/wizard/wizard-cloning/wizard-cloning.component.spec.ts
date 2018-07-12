import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { typeInElement } from '../../../../test/helpers/type-in-element';
import { AuthenticationTypes } from '../../../models/authentication-info';
import { CoreModule } from '../../core/core.module';
import { UIModule } from '../../ui/ui.module';
import { VcsRemoteService } from '../../vcs/shared/vcs-remote.service';
import { VcsRemoteProviderErrorCodes } from '../../vcs/vcs-remote-providers/vcs-remote-provider';
import { VcsModule } from '../../vcs/vcs.module';
import { WizardCloningComponent } from './wizard-cloning.component';


describe('browser.wizard.WizardCloningComponent', () => {
    let component: WizardCloningComponent;
    let fixture: ComponentFixture<WizardCloningComponent>;

    let vcsRemote: VcsRemoteService;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    CoreModule,
                    UIModule,
                    VcsModule,
                ],
                declarations: [WizardCloningComponent],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        vcsRemote = TestBed.get(VcsRemoteService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WizardCloningComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should emit \'backStep\' output event when click back step button.', () => {
        const callback = jasmine.createSpy('callback');
        component.backStep.subscribe(callback);

        const backStepButton = fixture.debugElement.query(
            By.css('button#back-step-button'),
        );
        backStepButton.nativeElement.click();
        fixture.detectChanges();

        expect(callback).toHaveBeenCalled();
    });

    describe('remote url validation', () => {
    });

    describe('authentication form', () => {
        const switchMethodOption = (type: AuthenticationTypes) => {
            const option = fixture.debugElement.query(By.css(
                `WizardCloning__authenticationForm input[type=radio][value=${type}]`),
            );

            if (option) {
                option.triggerEventHandler('change', {
                    target: option.nativeElement,
                });
            }
        };

        const getUserNameInputEl = (): HTMLInputElement =>
            fixture.debugElement.query(By.css('input#userNameInput')).nativeElement;

        const getPasswordInputEl = (): HTMLInputElement =>
            fixture.debugElement.query(By.css('input#passwordInput')).nativeElement;

        const getTokenInputEl = (): HTMLInputElement =>
            fixture.debugElement.query(By.css('input#tokeInput')).nativeElement;

        const getLoginButtonEl = (): HTMLButtonElement =>
            fixture.debugElement.query(By.css('button#loginButton')).nativeElement;

        const getLoginFailMessageEl = (): HTMLElement =>
            fixture.debugElement.query(By.css('.WizardCloning__loginFailError')).nativeElement;

        it('should show user name and password input field ' +
            'when choose \'BASIC\' option in radio button group.', () => {
            switchMethodOption(AuthenticationTypes.BASIC);
            fixture.detectChanges();

            expect(getUserNameInputEl()).toBeDefined();
            expect(getPasswordInputEl()).toBeDefined();
        });

        it('should show token input field ' +
            'when choose \'OAUTH2_TOKEN\' option in radio button group.', () => {
            switchMethodOption(AuthenticationTypes.OAUTH2_TOKEN);
            fixture.detectChanges();

            expect(getTokenInputEl()).toBeDefined();
        });

        it('should process login with basic authorization ' +
            'when click login button and current option is \'BASIC\'.', fakeAsync(() => {
            switchMethodOption(AuthenticationTypes.BASIC);
            fixture.detectChanges();

            spyOn(vcsRemote, 'loginWithBasicAuthorization').and.returnValue(of(null));

            const userNameInputEl = getUserNameInputEl();
            const passwordInputEl = getPasswordInputEl();

            typeInElement('user', userNameInputEl);
            typeInElement('password', passwordInputEl);
            fixture.detectChanges();

            const loginButtonEl = getLoginButtonEl();
            loginButtonEl.click();
            fixture.detectChanges();

            flush();

            expect(vcsRemote.loginWithBasicAuthorization).toHaveBeenCalledWith('user', 'password');
            expect(loginButtonEl.disabled).toBe(true);
        }));

        it('should process login with oauth2 token authorization ' +
            'when click login button and current option is \'OAUTH2_TOKEN\'.', fakeAsync(() => {
            switchMethodOption(AuthenticationTypes.OAUTH2_TOKEN);
            fixture.detectChanges();

            spyOn(vcsRemote, 'loginWithOauth2TokenAuthorization').and.returnValue(of(null));

            const tokenInputEl = getTokenInputEl();

            typeInElement('token', tokenInputEl);
            fixture.detectChanges();

            const loginButtonEl = getLoginButtonEl();
            loginButtonEl.click();
            fixture.detectChanges();

            flush();

            expect(vcsRemote.loginWithOauth2TokenAuthorization).toHaveBeenCalledWith('token');
            expect(loginButtonEl.disabled).toBe(true);
        }));

        it('should show login fail error when process got failed ' +
            'after process login with basic authorization.', fakeAsync(() => {
            switchMethodOption(AuthenticationTypes.BASIC);
            fixture.detectChanges();

            const error = {
                code: VcsRemoteProviderErrorCodes.AUTHENTICATE_ERROR,
            };

            spyOn(vcsRemote, 'loginWithBasicAuthorization').and.returnValue(throwError(error));

            const loginButtonEl = getLoginButtonEl();
            loginButtonEl.click();
            fixture.detectChanges();

            flush();

            expect(getLoginFailMessageEl()).toBeDefined();
        }));

        it('should show login fail error when process got failed ' +
            'after process login with oauth2 token authorization.', fakeAsync(() => {
            switchMethodOption(AuthenticationTypes.OAUTH2_TOKEN);
            fixture.detectChanges();

            const error = {
                code: VcsRemoteProviderErrorCodes.AUTHENTICATE_ERROR,
            };

            spyOn(vcsRemote, 'loginWithOauth2TokenAuthorization').and.returnValue(throwError(error));

            const loginButtonEl = getLoginButtonEl();
            loginButtonEl.click();
            fixture.detectChanges();

            flush();

            expect(getLoginFailMessageEl()).toBeDefined();
        }));
    });

    describe('clone', () => {
    });
});
