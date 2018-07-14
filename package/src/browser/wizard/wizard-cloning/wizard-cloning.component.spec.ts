import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { dispatchFakeEvent } from '../../../../test/helpers/dispatch-event';
import { expectDebugElement } from '../../../../test/helpers/expect-debug-element';
import { typeInElement } from '../../../../test/helpers/type-in-element';
import { MockDialog } from '../../../../test/mocks/browser/mock-dialog';
import { GitError, GitErrorCodes } from '../../../libs/git';
import { AuthenticationTypes } from '../../../models/authentication-info';
import { WORKSPACE_DIR_PATH } from '../../../models/workspace';
import { ConfirmDialog } from '../../core/confirm-dialog/confirm-dialog';
import { CoreModule } from '../../core/core.module';
import { ErrorComponent } from '../../ui/error/error.component';
import { RadioButtonComponent } from '../../ui/radio/radio-button.component';
import { UIModule } from '../../ui/ui.module';
import { VcsRemoteService } from '../../vcs/shared/vcs-remote.service';
import { VcsRemoteProviderErrorCodes } from '../../vcs/vcs-remote-providers/vcs-remote-provider';
import { VcsModule } from '../../vcs/vcs.module';
import { WizardCloningComponent } from './wizard-cloning.component';


describe('browser.wizard.WizardCloningComponent', () => {
    let component: WizardCloningComponent;
    let fixture: ComponentFixture<WizardCloningComponent>;

    let vcsRemote: VcsRemoteService;
    let confirmDialog: ConfirmDialog;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    CoreModule,
                    UIModule,
                    VcsModule,
                    ...MockDialog.importsForTesting,
                ],
                providers: [
                    ...MockDialog.providersForTesting,
                    ConfirmDialog,
                ],
                declarations: [WizardCloningComponent],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        vcsRemote = TestBed.get(VcsRemoteService);
        confirmDialog = TestBed.get(ConfirmDialog);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WizardCloningComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    const getRemoteUrlInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('input#remote-url-input')).nativeElement;

    const toggleAuthForm = () => {
        const toggling = fixture.debugElement.query(
            By.css('.WizardCloning__formToggling > button'),
        );

        toggling.nativeElement.click();
        fixture.detectChanges();
    };

    const switchMethodOption = (type: AuthenticationTypes) => {
        const options = fixture.debugElement.queryAll(
            By.directive(RadioButtonComponent),
        );
        const option = options.find(opt => opt.componentInstance.value === type);

        if (option) {
            const inputEl = option.query(By.css('input[type=radio]'));

            dispatchFakeEvent(inputEl.nativeElement, 'change');
            fixture.detectChanges();
        }
    };

    const getUserNameInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('input#user-name-input')).nativeElement;

    const getPasswordInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('input#password-input')).nativeElement;

    const getTokenInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('input#token-input')).nativeElement;

    const getLoginButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('button#login-button')).nativeElement;

    const getLoginFailMessageEl = (): HTMLElement =>
        fixture.debugElement.query(By.css('.WizardCloning__loginFailError')).nativeElement;

    const getCloneButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('button#clone-button')).nativeElement;

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
        it('should show required error when input value is empty ' +
            'after input element blur.', () => {
            const inputEl = getRemoteUrlInputEl();

            typeInElement('', inputEl);
            inputEl.blur();
            fixture.detectChanges();

            const visibleError = fixture.debugElement
                .queryAll(By.directive(ErrorComponent))
                .find(error => error.componentInstance.show);

            expect(visibleError).toBeDefined();
            expect(visibleError.componentInstance.errorName).toEqual('required');
        });

        it('should show invalid format error when input value is invalid ' +
            'after input element blur.', () => {
            const inputEl = getRemoteUrlInputEl();

            typeInElement('this_is_not_valid', inputEl);
            inputEl.blur();
            fixture.detectChanges();

            const visibleError = fixture.debugElement
                .queryAll(By.directive(ErrorComponent))
                .find(error => error.componentInstance.show);

            expect(visibleError).toBeDefined();
            expect(visibleError.componentInstance.errorName).toEqual('invalidFormat');
        });
    });

    describe('authentication form', () => {
        beforeEach(() => {
            toggleAuthForm();
        });

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

            const loginComplete = fixture.debugElement.query(
                By.css('.WizardCloning__loginComplete'),
            );

            expect(vcsRemote.loginWithBasicAuthorization).toHaveBeenCalledWith('user', 'password');
            expectDebugElement(loginComplete).toBeDisplayed();
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

            const loginComplete = fixture.debugElement.query(
                By.css('.WizardCloning__loginComplete'),
            );

            expect(vcsRemote.loginWithOauth2TokenAuthorization).toHaveBeenCalledWith('token');
            expectDebugElement(loginComplete).toBeDisplayed();
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
        it('should clone button be disabled if repository url is invalid.', () => {
            const remoteUrlInputEl = getRemoteUrlInputEl();

            typeInElement('this_is_invalid', remoteUrlInputEl);
            remoteUrlInputEl.blur();
            fixture.detectChanges();

            expectDebugElement(fixture.debugElement.query(By.css('#clone-button')))
                .toBeDisabled();
        });

        it('should show authentication error when clone failed.', fakeAsync(() => {
            const url = 'https://github.com/owner/repo.git';
            const remoteUrlInputEl = getRemoteUrlInputEl();

            typeInElement(url, remoteUrlInputEl);
            remoteUrlInputEl.blur();
            fixture.detectChanges();

            const error = new GitError(GitErrorCodes.AUTHENTICATION_FAIL);

            spyOn(vcsRemote, 'cloneRepository').and.returnValue(throwError(error));
            spyOn(confirmDialog, 'openAlert');

            getCloneButtonEl().click();
            fixture.detectChanges();

            flush();

            expect(vcsRemote.cloneRepository).toHaveBeenCalledWith(url, WORKSPACE_DIR_PATH);
            expect(confirmDialog.openAlert).toHaveBeenCalledWith({
                title: 'Error',
                content: error.errorDescription,
            });
        }));

        it('should emit clone complete output after clone if success.', fakeAsync(() => {
            const url = 'https://github.com/owner/repo.git';
            const remoteUrlInputEl = getRemoteUrlInputEl();

            typeInElement(url, remoteUrlInputEl);
            remoteUrlInputEl.blur();
            fixture.detectChanges();

            spyOn(vcsRemote, 'cloneRepository').and.returnValue(of(null));

            const output = jasmine.createSpy('output');
            component.cloneComplete.subscribe(output);

            getCloneButtonEl().click();
            fixture.detectChanges();

            flush();

            expect(vcsRemote.cloneRepository).toHaveBeenCalledWith(url, WORKSPACE_DIR_PATH);
            expect(output).toHaveBeenCalled();
        }));
    });
});
