import { encodePathAsUrl } from '../../common/path';
import { Window } from './window';


export class AppWindow extends Window {
    constructor() {
        const url = encodePathAsUrl(__dirname, 'app/index.html');

        super(url, {
            width: 1440,
            height: 1080,
            minWidth: 700,
            minHeight: 480,
        });
    }
}
