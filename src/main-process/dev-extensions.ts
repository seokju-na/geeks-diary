import { app } from 'electron';
import { environment } from '../core/environment';


if (!environment.production) {
    const installExtension = require('electron-devtools-installer').default;
    const extensions = [
        { name: 'Redux DevTools', id: 'lmhkpmbekcpmknklioeibfkpmmfibljd' },
    ];

    app.once('ready', () => {
        const userDataPath = environment.getPath('userData');

        extensions.forEach((extension) => {
            installExtension(extension.id)
                .then(() => {
                    console.log(extension.name + ' installed in ' + userDataPath);
                }).catch((error) => {
                    console.error('Failed to install ' + extension.name, error);
                });
        });
    });
}
