import { DatetimeDummy, Dummy, EmailDummy, SHADummy, TextDummy, TypesDummy } from '../../test/helpers';
import { VcsAccount, VcsAuthenticationInfo, VcsAuthenticationTypes, VcsCommitItem } from './vcs';


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


export class VcsCommitItemDummy implements Dummy<VcsCommitItem> {
    private sha = new SHADummy();
    private name = new TextDummy('John');
    private email = new EmailDummy();
    private summary = new TextDummy('Summary');
    private description = new TextDummy('Description');
    private timestamp = new DatetimeDummy();

    create(): VcsCommitItem {
        const commitId = this.sha.create();
        const name = this.name.create();
        const email = this.email.create();

        return {
            commitId,
            commitHash: commitId,
            authorName: name,
            authorEmail: email,
            committerName: name,
            committerEmail: email,
            summary: this.summary.create(),
            description: this.description.create(),
            timestamp: this.timestamp.create(),
        };
    }
}
