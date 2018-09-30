import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import {
    dispatchFakeEvent,
    fastTestSetup,
    getVisibleErrorAt,
    NoopComponent,
    NoopModule,
    typeInElement,
} from '../../../../test/helpers';
import { MockDialog } from '../../../../test/mocks/browser';
import { VcsAuthenticationTypes, VcsError, VcsErrorCodes } from '../../../core/vcs';
import { Dialog } from '../../ui/dialog';
import { RadioButtonComponent } from '../../ui/radio';
import { UiModule } from '../../ui/ui.module';
import { VcsRemoteService } from '../../vcs/vcs-remote';
import { VcsModule } from '../../vcs/vcs.module';
import { WizardCloningComponent } from './wizard-cloning.component';


describe('browser.wizard.wizardCloning.WizardCloningComponent', () => {
    let fixture: ComponentFixture<WizardCloningComponent>;
    let component: WizardCloningComponent;

    let vcsRemote: VcsRemoteService;
    let mockDialog: MockDialog;
    let mockLocation: SpyLocation;

    const getRemoteUrlInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('#remote-url-input')).nativeElement as HTMLInputElement;

    const getUserNameInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('input#username-input')).nativeElement as HTMLInputElement;

    const getPasswordInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('input#password-input')).nativeElement as HTMLInputElement;

    const getTokenInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('input#token-input')).nativeElement as HTMLInputElement;

    const getLoginFailMessageEl = (): HTMLElement =>
        fixture.debugElement.query(By.css('.WizardCloning__loginFailError')).nativeElement as HTMLElement;

    const getCloneButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('#clone-button')).nativeElement as HTMLButtonElement;

    function toggleAuthForm(): void {
        const toggleButton = fixture.debugElement.query(By.css('.WizardCloning__formToggling button'));
        (toggleButton.nativeElement as HTMLButtonElement).click();
        fixture.detectChanges();
    }

    function ensureAuthenticationInfoToBeExists(): void {
        component['activatedRoute'].snapshot.data = {
            isAuthenticationInfoExists: true,
        };
    }

    function ensureAuthenticationInfoToBeNotExists(): void {
        component['activatedRoute'].snapshot.data = {
            isAuthenticationInfoExists: false,
        };
    }

    function switchAuthMethodOption(type: VcsAuthenticationTypes): void {
        const options = fixture.debugElement.queryAll(
            By.directive(RadioButtonComponent),
        );
        const option = options.find(opt => opt.componentInstance.value === type);

        if (option) {
            const inputEl = option.query(By.css('input[type=radio]'));

            dispatchFakeEvent(inputEl.nativeElement, 'change');
            fixture.detectChanges();
        }
    }

    function submitAuthLoginForm(): void {
        const loginButtonDe = fixture.debugElement.query(By.css('button#login-button'));
        (loginButtonDe.nativeElement as HTMLButtonElement).click();
    }

    fastTestSetup();

    beforeAll(async () => {
        const route = {
            snapshot: {
                data: { isAuthenticationInfoExists: false },
            },
        };

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    VcsModule,
                    NoopModule,
                    RouterTestingModule.withRoutes([
                        { path: '', component: NoopComponent },
                    ]),
                    ...MockDialog.imports(),
                ],
                providers: [
                    ...MockDialog.providers(),
                    { provide: ActivatedRoute, useValue: route },
                    { provide: Location, useClass: SpyLocation },
                ],
                declarations: [WizardCloningComponent],
            })
            .compileComponents();
    });

    beforeEach(() => {
        vcsRemote = TestBed.get(VcsRemoteService);
        mockDialog = TestBed.get(Dialog);
        mockLocation = TestBed.get(Location);

        fixture = TestBed.createComponent(WizardCloningComponent);
        component = fixture.componentInstance;
    });

    describe('remote url validation', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should show required error when input value is empty after input element blur.', () => {
            const inputEl = getRemoteUrlInputEl();

            typeInElement('', inputEl);
            fixture.detectChanges();

            inputEl.blur();
            fixture.detectChanges();

            const visibleError = getVisibleErrorAt(
                fixture.debugElement.query(By.css('#remote-url-form-field')),
            );

            expect(visibleError).not.toBeNull();
            expect(visibleError.errorName).toEqual('required');
        });

        it('should show invalid format error when input value is empty after input element '
            + 'blur.', () => {
            const inputEl = getRemoteUrlInputEl();

            typeInElement('this_is_not_valid_url', inputEl);
            inputEl.blur();
            fixture.detectChanges();

            const visibleError = getVisibleErrorAt(
                fixture.debugElement.query(By.css('#remote-url-form-field')),
            );

            expect(visibleError).not.toBeNull();
            expect(visibleError.errorName).toEqual('invalidFormat');
        });
    });

    describe('authentication form displaying', () => {
        it('should auth form toggling not to be exists if authentication info exists.', () => {
            ensureAuthenticationInfoToBeExists();
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.WizardCloning__loginCompleted'))).not.toBeNull();
            expect(fixture.debugElement.query(By.css('.WizardCloning__formToggling'))).toBeNull();
        });

        it('should show auth form when toggles.', () => {
            ensureAuthenticationInfoToBeNotExists();
            fixture.detectChanges();

            toggleAuthForm();

            expect(fixture.debugElement.query(By.css('.WizardCloning__authenticationForm'))).not.toBeNull();
        });
    });

    describe('authentication form working', () => {
        beforeEach(() => {
            ensureAuthenticationInfoToBeNotExists();
            fixture.detectChanges();
            toggleAuthForm();
        });

        it('should show user name and password input field ' +
            'when choose \'BASIC\' option in radio button group.', () => {
            switchAuthMethodOption(VcsAuthenticationTypes.BASIC);
            fixture.detectChanges();

            expect(getUserNameInputEl()).toBeDefined();
            expect(getPasswordInputEl()).toBeDefined();
        });

        it('should show token input field ' +
            'when choose \'OAUTH2_TOKEN\' option in radio button group.', () => {
            switchAuthMethodOption(VcsAuthenticationTypes.OAUTH2_TOKEN);
            fixture.detectChanges();

            expect(getTokenInputEl()).toBeDefined();
        });

        it('should process login with basic authorization ' +
            'when click login button and current option is \'BASIC\'.', fakeAsync(() => {
            switchAuthMethodOption(VcsAuthenticationTypes.BASIC);
            fixture.detectChanges();

            spyOn(vcsRemote, 'loginWithBasicAuthorization').and.returnValue(of(null));

            const userNameInputEl = getUserNameInputEl();
            const passwordInputEl = getPasswordInputEl();

            typeInElement('user', userNameInputEl);
            typeInElement('password', passwordInputEl);
            fixture.detectChanges();

            submitAuthLoginForm();
            flush();

            fixture.detectChanges();

            const loginComplete = fixture.debugElement.query(
                By.css('.WizardCloning__loginCompleted'),
            );

            expect(vcsRemote.loginWithBasicAuthorization).toHaveBeenCalledWith('user', 'password');
            expect(loginComplete).not.toBeNull();
        }));

        it('should process login with oauth2 token authorization ' +
            'when click login button and current option is \'OAUTH2_TOKEN\'.', fakeAsync(() => {
            switchAuthMethodOption(VcsAuthenticationTypes.OAUTH2_TOKEN);
            fixture.detectChanges();

            spyOn(vcsRemote, 'loginWithOauth2TokenAuthorization').and.returnValue(of(null));

            const tokenInputEl = getTokenInputEl();

            typeInElement('token', tokenInputEl);
            fixture.detectChanges();

            submitAuthLoginForm();
            flush();

            fixture.detectChanges();

            const loginComplete = fixture.debugElement.query(
                By.css('.WizardCloning__loginCompleted'),
            );

            expect(vcsRemote.loginWithOauth2TokenAuthorization).toHaveBeenCalledWith('token');
            expect(loginComplete).not.toBeNull();
        }));

        it('should show login fail error when process got failed ' +
            'after process login with basic authorization.', fakeAsync(() => {
            switchAuthMethodOption(VcsAuthenticationTypes.BASIC);
            fixture.detectChanges();

            const error = new VcsError(VcsErrorCodes.AUTHENTICATE_ERROR);

            spyOn(vcsRemote, 'loginWithBasicAuthorization').and.returnValue(throwError(error));

            submitAuthLoginForm();
            flush();
            fixture.detectChanges();

            expect(getLoginFailMessageEl()).toBeDefined();
        }));

        it('should show login fail error when process got failed ' +
            'after process login with oauth2 token authorization.', fakeAsync(() => {
            switchAuthMethodOption(VcsAuthenticationTypes.OAUTH2_TOKEN);
            fixture.detectChanges();

            const error = new VcsError(VcsErrorCodes.AUTHENTICATE_ERROR);

            spyOn(vcsRemote, 'loginWithOauth2TokenAuthorization').and.returnValue(throwError(error));

            submitAuthLoginForm();
            flush();
            fixture.detectChanges();

            expect(getLoginFailMessageEl()).toBeDefined();
        }));
    });

    describe('clone', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });
    });
});
