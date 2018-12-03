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
import { GitAuthenticationFailError } from '../../../core/git';
import { VcsAuthenticateError, VcsAuthenticationTypes } from '../../../core/vcs';
import { WORKSPACE_DIR_PATH } from '../../../core/workspace';
import { SharedModule, WorkspaceService } from '../../shared';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog';
import { Dialog } from '../../ui/dialog';
import { RadioButtonComponent } from '../../ui/radio';
import { UiModule } from '../../ui/ui.module';
import { VcsService } from '../../vcs';
import { WizardCloningComponent } from './wizard-cloning.component';
import Spy = jasmine.Spy;


describe('browser.wizard.wizardCloning.WizardCloningComponent', () => {
    let fixture: ComponentFixture<WizardCloningComponent>;
    let component: WizardCloningComponent;

    let vcs: VcsService;
    let workspace: WorkspaceService;
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

    function clickCloneButton(): void {
        getCloneButtonEl().click();
    }

    fastTestSetup();

    beforeAll(async () => {
        const route = {
            snapshot: {
                data: { isAuthenticationInfoExists: false },
            },
        };

        vcs = jasmine.createSpyObj('vcs', [
            'setRemoveProvider',
            'isRemoteRepositoryUrlValid',
            'loginRemoteWithBasicAuthorization',
            'loginRemoteWithOauth2TokenAuthorization',
            'cloneRepository',
        ]);

        (vcs.setRemoveProvider as Spy).and.returnValue(vcs);

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    SharedModule,
                    NoopModule,
                    RouterTestingModule.withRoutes([
                        { path: '', component: NoopComponent },
                    ]),
                    ...MockDialog.imports(),
                ],
                providers: [
                    ...MockDialog.providers(),
                    { provide: VcsService, useValue: vcs },
                    { provide: ActivatedRoute, useValue: route },
                    { provide: Location, useClass: SpyLocation },
                ],
                declarations: [WizardCloningComponent],
            })
            .compileComponents();
    });

    beforeEach(() => {
        vcs = TestBed.get(VcsService);
        workspace = TestBed.get(WorkspaceService);
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

            (vcs.isRemoteRepositoryUrlValid as Spy).and.returnValue(false);

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

            (vcs.loginRemoteWithBasicAuthorization as Spy).and.returnValue(of(null));

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

            expect(vcs.loginRemoteWithBasicAuthorization).toHaveBeenCalledWith('user', 'password');
            expect(loginComplete).not.toBeNull();
        }));

        it('should process login with oauth2 token authorization ' +
            'when click login button and current option is \'OAUTH2_TOKEN\'.', fakeAsync(() => {
            switchAuthMethodOption(VcsAuthenticationTypes.OAUTH2_TOKEN);
            fixture.detectChanges();

            (vcs.loginRemoteWithOauth2TokenAuthorization as Spy).and.returnValue(of(null));

            const tokenInputEl = getTokenInputEl();

            typeInElement('token', tokenInputEl);
            fixture.detectChanges();

            submitAuthLoginForm();
            flush();

            fixture.detectChanges();

            const loginComplete = fixture.debugElement.query(
                By.css('.WizardCloning__loginCompleted'),
            );

            expect(vcs.loginRemoteWithOauth2TokenAuthorization).toHaveBeenCalledWith('token');
            expect(loginComplete).not.toBeNull();
        }));

        it('should show login fail error when process got failed ' +
            'after process login with basic authorization.', fakeAsync(() => {
            switchAuthMethodOption(VcsAuthenticationTypes.BASIC);
            fixture.detectChanges();

            const error = new VcsAuthenticateError();

            (vcs.loginRemoteWithBasicAuthorization as Spy).and.returnValue(throwError(error));

            submitAuthLoginForm();
            flush();
            fixture.detectChanges();

            expect(getLoginFailMessageEl()).toBeDefined();
        }));

        it('should show login fail error when process got failed ' +
            'after process login with oauth2 token authorization.', fakeAsync(() => {
            switchAuthMethodOption(VcsAuthenticationTypes.OAUTH2_TOKEN);
            fixture.detectChanges();

            const error = new VcsAuthenticateError();

            (vcs.loginRemoteWithOauth2TokenAuthorization as Spy).and.returnValue(throwError(error));

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

        it('should clone button to be disabled if remote url input is invalid.', () => {
            (vcs.isRemoteRepositoryUrlValid as Spy).and.returnValue(false);

            typeInElement('this_is_invalid_remote_url', getRemoteUrlInputEl());
            getRemoteUrlInputEl().blur();
            fixture.detectChanges();

            expect(getCloneButtonEl().disabled).toBe(true);
        });

        it('should show authentication error with alert dialog when clone failed.', fakeAsync(() => {
            const url = 'https://github.com/owner/repo.git';
            const remoteUrlInputEl = getRemoteUrlInputEl();

            (vcs.isRemoteRepositoryUrlValid as Spy).and.returnValue(true);

            typeInElement(url, remoteUrlInputEl);
            remoteUrlInputEl.blur();
            fixture.detectChanges();

            const error = new GitAuthenticationFailError();

            (vcs.cloneRepository as Spy).and.returnValue(throwError(error));

            clickCloneButton();
            flush();

            expect(vcs.cloneRepository).toHaveBeenCalledWith(url, WORKSPACE_DIR_PATH);

            const alertDialogRef = mockDialog.getByComponent<ConfirmDialogComponent,
                ConfirmDialogData,
                void>(
                ConfirmDialogComponent,
            );

            expect(alertDialogRef).toBeDefined();
            expect(alertDialogRef.config.data.isAlert).toBe(true);
            expect(alertDialogRef.config.data.body).toEqual(error.message);
        }));

        it('should call init workspace after clone complete.', fakeAsync(() => {
            const url = 'https://github.com/owner/repo.git';
            const remoteUrlInputEl = getRemoteUrlInputEl();

            (vcs.isRemoteRepositoryUrlValid as Spy).and.returnValue(true);

            typeInElement(url, remoteUrlInputEl);
            remoteUrlInputEl.blur();
            fixture.detectChanges();

            (vcs.cloneRepository as Spy).and.returnValue(of(null));
            spyOn(workspace, 'initWorkspace').and.returnValue(of(null));

            getCloneButtonEl().click();
            fixture.detectChanges();

            flush();

            expect(vcs.cloneRepository).toHaveBeenCalledWith(url, WORKSPACE_DIR_PATH);
            expect(workspace.initWorkspace).toHaveBeenCalled();
        }));
    });
});
