import { createDummies } from '../../../test/helpers';
import { VcsFileChangeDummy } from './dummies';
import { UpdateFileChangesAction } from './vcs.actions';
import { vcsReducer } from './vcs.reducer';


describe('browser.vcs.vcsReducer', () => {
    const fileChangeDummy = new VcsFileChangeDummy();

    describe('UPDATE_FILE_CHANGES', () => {
        it('should set file changes.', () => {
            const fileChanges = createDummies(fileChangeDummy, 10);
            const action = new UpdateFileChangesAction({ fileChanges });

            const result = vcsReducer(undefined, action);

            expect(result.fileChanges).toEqual(fileChanges);
        });
    });
});
