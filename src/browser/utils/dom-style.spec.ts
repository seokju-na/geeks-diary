import { objectifyStyleStr, removeDomStyle, stringifyStyleObj, updateDomStyles } from './dom-style';


describe('browser.utils.domStyle', () => {
    describe('stringifyStyleObj', () => {
        it('should convert style object to string.', () => {
            const styleObj = {
                'padding-top': '10px',
                overflow: 'hidden',
            };

            expect(stringifyStyleObj(styleObj))
                .toEqual('padding-top:10px;overflow:hidden;');
        });
    });

    describe('objectifyStyleStr', () => {
        it('should convert style string to object.', () => {
            const styleStr = 'padding-top:10px;overflow:hidden;';

            expect(objectifyStyleStr(styleStr)).toEqual({
                'padding-top': '10px',
                overflow: 'hidden',
            });
        });
    });

    describe('updateDomStyles', () => {
        let element: HTMLElement;

        beforeEach(() => {
            element = document.createElement('DIV');
        });

        it('should not add style attribute if style object is empty.', () => {
            updateDomStyles(element, {});
            expect(element.getAttribute('style')).toBeNull();
        });

        it('should update DOM element style attribute with style object.', () => {
            updateDomStyles(element, {
                'padding-top': '10px',
            });

            expect(element.getAttribute('style')).toEqual('padding-top:10px;');
        });

        it('should update only the input css style.', () => {
            element.setAttribute('style', 'padding-top:10px;overflow:hidden;');

            updateDomStyles(element, {
                'padding-top': '20px',
            });

            expect(element.getAttribute('style'))
                .toEqual('padding-top:20px;overflow:hidden;');
        });
    });

    describe('removeDomStyle', () => {
        let element: HTMLElement;

        beforeEach(() => {
            element = document.createElement('DIV');
        });

        it('should remove css style from DOM element style attribute.', () => {
            element.setAttribute('style', 'padding-top:10px;overflow:hidden;');

            removeDomStyle(element, 'padding-top');

            expect(element.getAttribute('style')).toEqual('overflow:hidden;');
        });

        it('should remove style attribute if style object is empty.', () => {
            element.setAttribute('style', 'padding-top:10px;');

            removeDomStyle(element, 'padding-top');

            expect(element.getAttribute('style')).toBeNull();
        });

        it('should not remove css style that DOM element does not contains.', () => {
            element.setAttribute('style', 'padding-top:10px;');

            removeDomStyle(element, 'overflow');

            expect(element.getAttribute('style')).toEqual('padding-top:10px;');
        });
    });
});
