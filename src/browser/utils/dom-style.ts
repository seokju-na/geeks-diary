interface StyleObj {
    [key: string]: string;
}


function _isStyleObjEmpty(styleObj: StyleObj): boolean {
    return Object.keys(styleObj).length === 0;
}


/**
 * Convert style object to style string.
 *
 * @example
 * const styleObj = { 'padding-top': '10px', overflow: 'hidden' };
 *
 * stringifyStyleObj(styleObj); // 'padding-top:10px;overflow:hidden;'
 *
 * @param styleObj
 */
export function stringifyStyleObj(styleObj: StyleObj): string {
    return Object.keys(styleObj).reduce(
        (str, name) => str + `${name}:${styleObj[name]};`,
        '',
    );
}


/**
 * Convert style string to style object.
 *
 * @example
 * const styleStr = 'padding-top:10px;overflow:hidden;';
 *
 * objectifyStyleStr(styleStr); // { 'padding-top': '10px', overflow: 'hidden' }
 *
 * @param styleStr
 */
export function objectifyStyleStr(styleStr: string): StyleObj {
    const styleObj: StyleObj = {};
    const cssStyles = styleStr.split(';');

    cssStyles.forEach((css) => {
        const [name, value] = css.split(':');

        if (name && value) {
            styleObj[name] = value;
        }
    });

    return styleObj;
}


/**
 * Update DOM element css style with using 'style' attribute.
 * @param element
 * @param styleObj
 */
export function updateDomStyles(
    element: HTMLElement,
    styleObj: { [key: string]: string },
): void {
    const styleStr = element.getAttribute('style') || '';
    const _styleObj = {
        ...objectifyStyleStr(styleStr),
        ...styleObj,
    };

    if (!_isStyleObjEmpty(_styleObj)) {
        element.setAttribute('style', stringifyStyleObj(_styleObj));
    }
}


/**
 * Remove given css style from 'style' attribute.
 * @param element
 * @param styleName
 */
export function removeDomStyle(
    element: HTMLElement,
    styleName: string,
): void {
    const styleStr = element.getAttribute('style') || '';
    const styleObj = objectifyStyleStr(styleStr);

    if (styleObj[styleName]) {
        delete styleObj[styleName];
    }

    if (_isStyleObjEmpty(styleObj)) {
        element.removeAttribute('style');
    } else {
        element.setAttribute('style', stringifyStyleObj(styleObj));
    }
}
