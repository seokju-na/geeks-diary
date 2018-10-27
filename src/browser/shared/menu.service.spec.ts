import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { fastTestSetup } from '../../../test/helpers';
import { IpcMessage } from '../../libs/ipc';
import { MenuEvent, MenuService } from './menu.service';


describe('browser.shared.MenuService', () => {
    let menu: MenuService;

    fastTestSetup();

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [MenuService],
        });
    });

    beforeEach(() => {
        menu = TestBed.get(MenuService);
    });

    afterEach(() => {
        menu.ngOnDestroy();
    });

    describe('ngOnDestroy', () => {
        it('should destroy ipc client on ngOnDestroy.', () => {
            spyOn(menu['ipcClient'], 'destroy').and.callThrough();
            menu.ngOnDestroy();

            expect((menu['ipcClient'] as any).destroy as jasmine.Spy).toHaveBeenCalled();
        });
    });

    describe('onMessage', () => {
        it('should send correct event.', () => {
            const messages = new Subject<IpcMessage<any>>();
            spyOn(menu['ipcClient'], 'onMessage').and.returnValue(messages.asObservable());

            const callback = jasmine.createSpy('on message callback');
            const subscription = menu.onMessage().subscribe(callback);

            // New text snippet
            messages.next({ name: 'newTextSnippet' });
            expect(callback).toHaveBeenCalledWith(MenuEvent.NEW_TEXT_SNIPPET);

            // New code snippet
            messages.next({ name: 'newCodeSnippet' });
            expect(callback).toHaveBeenCalledWith(MenuEvent.NEW_CODE_SNIPPET);

            messages.complete();
            subscription.unsubscribe();
        });
    });
});
