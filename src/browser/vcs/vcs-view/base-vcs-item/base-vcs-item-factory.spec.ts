import { TestBed } from '@angular/core/testing';
import { createDummies, fastTestSetup } from '../../../../../test/helpers';
import { VcsFileChangeDummy } from '../../dummies';
import { BaseVcsItemFactory } from './base-vcs-item-factory';
import { BaseVcsItemComponent } from './base-vcs-item.component';


describe('browser.vcs.vcsView.BaseVcsItemFactory', () => {
    let factory: BaseVcsItemFactory;

    const fileChangeDummy = new VcsFileChangeDummy();

    fastTestSetup();

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [BaseVcsItemFactory],
        });
    });

    beforeEach(() => {
        factory = TestBed.get(BaseVcsItemFactory);
    });

    describe('create', () => {
        it('should output result correctly.', () => {
            const fileChanges = createDummies(fileChangeDummy, 5);
            const result = factory.create(fileChanges);

            expect(result.usedFileChanges).toEqual(fileChanges);

            result.refs.forEach((ref, index) => {
                expect(ref.component).toEqual(BaseVcsItemComponent);
                expect(ref._config.fileChanges).toEqual([fileChanges[index]]);
                expect(ref._config.checked).toBe(false);
            });
        });
    });
});
