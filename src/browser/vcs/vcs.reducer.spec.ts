import { createDummies } from '../../../test/helpers';
import { VcsCommitItemDummy } from '../../core/dummies';
import { VcsCommitItem } from '../../core/vcs';
import { VcsFileChangeDummy } from './dummies';
import { LoadCommitHistoryAction, LoadMoreCommitHistoryAction, UpdateFileChangesAction } from './vcs.actions';
import { vcsReducer } from './vcs.reducer';
import { VcsState } from './vcs.state';


describe('browser.vcs.vcsReducer', () => {
    const fileChangeDummy = new VcsFileChangeDummy();
    const commitItemDummy = new VcsCommitItemDummy();

    describe('UPDATE_FILE_CHANGES', () => {
        it('should set file changes.', () => {
            const fileChanges = createDummies(fileChangeDummy, 10);
            const action = new UpdateFileChangesAction({ fileChanges });

            const result = vcsReducer(undefined, action);

            expect(result.fileChanges).toEqual(fileChanges);
        });
    });

    describe('LOAD_COMMIT_HISTORY', () => {
        it('should set commit history.', () => {
            const history = createDummies(commitItemDummy, 10);
            const action = new LoadCommitHistoryAction({ history, allLoaded: false });

            const result = vcsReducer(undefined, action);

            expect(result.history).toEqual(history);
            expect(result.allHistoryLoaded).toBe(false);
        });

        it('should set \'allHistoryLoaded\' to true, if all history are loaded.', () => {
            const history = createDummies(commitItemDummy, 10);
            const action = new LoadCommitHistoryAction({ history, allLoaded: true });

            const result = vcsReducer(undefined, action);

            expect(result.allHistoryLoaded).toBe(true);
        });
    });

    describe('LOAD_MORE_COMMIT_HISTORY', () => {
        let beforeState: VcsState;
        let beforeHistory: VcsCommitItem[];

        beforeEach(() => {
            beforeHistory = createDummies(commitItemDummy, 10);
            beforeState = vcsReducer(undefined, new LoadCommitHistoryAction({
                history: beforeHistory,
                allLoaded: false,
            }));
        });

        it('should append commit history.', () => {
            const moreHistory = createDummies(commitItemDummy, 10);
            const action = new LoadMoreCommitHistoryAction({ history: moreHistory, allLoaded: false });

            const result = vcsReducer(beforeState, action);

            expect(result.history).toEqual([...beforeHistory, ...moreHistory]);
            expect(result.allHistoryLoaded).toBe(false);
        });
    });
});
