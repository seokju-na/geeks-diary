import { Dummy, TextDummy, TypesDummy } from '../../test/helpers/dummies';
import { AuthenticationInfo, AuthenticationTypes } from './authentication-info';


export class AuthenticationInfoDummy extends Dummy<AuthenticationInfo> {
    private type = new TypesDummy<AuthenticationTypes>([
        AuthenticationTypes.BASIC,
        AuthenticationTypes.OAUTH2_TOKEN,
    ]);
    private authorizationHeader = new TextDummy('AuthorizationHeader');
    private providerName = new TextDummy('provider');
    private userName = new TextDummy('username');
    private password = new TextDummy('password');
    private token = new TextDummy('token');

    create(type?: AuthenticationTypes): AuthenticationInfo {
        return {
            type: type ? type : this.type.create(),
            authorizationHeader: this.authorizationHeader.create(),
            providerName: this.providerName.create(),
            username: this.userName.create(),
            password: this.password.create(),
            token: this.token.create(),
        };
    }
}
