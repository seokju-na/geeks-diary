export enum AuthenticationTypes {
    BASIC = 'BASIC',
    OAUTH2_TOKEN = 'OAUTH2_TOKEN',
}


export interface AuthenticationInfo {
    readonly type: AuthenticationTypes;
    readonly authorizationHeader: string;
    readonly providerName: string;

    /** BASIC */
    readonly username?: string;
    readonly password?: string;

    /** OAUTH2_TOKEN */
    readonly token?: string;
}
