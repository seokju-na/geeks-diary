import * as assert from 'assert';
import { isRendererProcess } from './process';


describe('libs.process', () => {
    it('ho!', () => {
        assert.strictEqual(isRendererProcess(), false);
    });
});
