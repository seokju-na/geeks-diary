import { inject, TestBed } from '@angular/core/testing';
import { MonacoService } from '../core/monaco.service';
import { StackViewer } from './stack-viewer';


describe('app.stack.StackViewer', () => {
    let stackViewer: StackViewer;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                providers: [
                    MonacoService,
                    StackViewer,
                ],
            });
    });

    beforeEach(inject(
        [StackViewer],
        (s: StackViewer) => {
            stackViewer = s;
        },
    ));

    it('', () => {
        // console.log(stackViewer.stacks);
    });
});
