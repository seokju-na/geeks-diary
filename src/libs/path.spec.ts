import { expect } from 'chai';
import { isOutsidePath } from './path';


describe('libs.path', () => {
    describe('isOutsidePath', () => {
        it('should return \'true\' if source is outside of dist path.', () => {
            expect(isOutsidePath('/x/y/z', '/x/y/z/v')).to.equal(true);
        });

        it('should return \'false\' if source is not outside of dist path.', () => {
            expect(isOutsidePath('/x/y/z', '/x/y')).to.equal(false);
        });
    });
});
