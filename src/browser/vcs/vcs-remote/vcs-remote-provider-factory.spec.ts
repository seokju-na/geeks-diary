import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fastTestSetup } from '../../../../test/helpers';
import { VcsRemoteGithubProvider } from './vcs-remote-github-provider';
import { VcsRemoteProviderFactory } from './vcs-remote-provider-factory';


describe('browser.vcs.vcsRemote.VcsRemoteProviderFactory', () => {
    let factory: VcsRemoteProviderFactory;

    fastTestSetup();

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [VcsRemoteProviderFactory],
        });
    });

    beforeEach(() => {
        factory = TestBed.get(VcsRemoteProviderFactory);
    });

    it('should return created provider matching with type.', () => {
        expect(factory.create('github') instanceof VcsRemoteGithubProvider).toBe(true);
    });
});
