import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationTypes } from '../../../models/authentication-info';
import { WORKSPACE_DIR_PATH } from '../../../models/workspace';


@Component({
    selector: 'gd-wizard-cloning',
    templateUrl: './wizard-cloning.component.html',
    styleUrls: ['./wizard-cloning.component.scss'],
})
export class WizardCloningComponent implements OnInit {
    @Output() readonly backStep = new EventEmitter<void>();

    remoteUrl = new FormControl('', [Validators.required]);
    workspaceDirectory = new FormControl(WORKSPACE_DIR_PATH);

    authenticationForm = new FormGroup({
        type: new FormControl(AuthenticationTypes.BASIC),
        userName: new FormControl(''),
        password: new FormControl(''),
        token: new FormControl(''),
    });

    authFormToggled = false;

    readonly BASIC_AUTH_TYPE = AuthenticationTypes.BASIC;
    readonly OAUTH2_TOKEN_AUTH_TYPE = AuthenticationTypes.OAUTH2_TOKEN;

    constructor() {
    }

    get authType(): AuthenticationTypes {
        return this.authenticationForm.get('type').value;
    }

    ngOnInit(): void {
        // this.workspaceDirectory.disable();
    }

    goToBack(): void {
        this.backStep.emit();
    }

    toggleAuthForm(): void {
        this.authFormToggled = !this.authFormToggled;
    }
}
