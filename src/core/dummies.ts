import { Dummy, TextDummy, TypesDummy } from '../../test/helpers';
import { VcsAuthenticationInfo, VcsAuthenticationTypes } from './vcs';


export class VcsAuthenticationInfoDummy extends Dummy<VcsAuthenticationInfo> {
    private type = new TypesDummy<VcsAuthenticationTypes>([
        VcsAuthenticationTypes.BASIC,
        VcsAuthenticationTypes.OAUTH2_TOKEN,
    ]);
    private authorizationHeader = new TextDummy('AuthorizationHeader');
    private providerName = new TextDummy('provider');
    private userName = new TextDummy('username');
    private password = new TextDummy('password');
    private token = new TextDummy('token');

    create(type?: VcsAuthenticationTypes): VcsAuthenticationInfo {
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
