import * as camelCase from 'lodash.camelcase';


export function domStyle(elem: HTMLElement, styles: {[key: string]: string}) {
    for (const prop of Object.keys(styles)) {
        let propName = camelCase(prop);

        if (propName === 'float') {
            propName = 'cssFloat';
        }

        elem.style[propName] = styles[prop];
    }
}
