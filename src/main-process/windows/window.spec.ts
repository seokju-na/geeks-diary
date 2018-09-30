import { expect } from 'chai';
import { AppWindow } from './app.window';
import { Window } from './window';


describe('mainProcess.windows', () => {
    describe('Window', () => {
        class TestWindow extends Window {
            constructor() {
                super('test.html', {
                    width: 600,
                });
            }

            handleEvents(): void {
            }
        }

        it('hohoho', () => {
            const instance = new TestWindow();

            expect(instance.options.width).to.equal(600);
            expect(instance.url).to.contain('test.html');
        });
    });
});
