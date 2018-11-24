import { Dummy, EmailDummy, TextDummy, TypesDummy } from '../../test/helpers';
import { VcsAccount, VcsAuthenticationInfo, VcsAuthenticationTypes } from './vcs';


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


export class VcsAccountDummy implements Dummy<VcsAccount> {
    private name = new TextDummy('Tommy');
    private email = new EmailDummy();
    private auth = new VcsAuthenticationInfoDummy();

    create(type?: VcsAuthenticationTypes): VcsAccount {
        return {
            name: this.name.create(),
            email: this.email.create(),
            authentication: this.auth.create(type),
        };
    }
}
