import { app } from 'electron';
import { environment } from '../environments/environment';


if (!environment.config.production) {
    const installExtension = require('electron-devtools-installer').default;
    const extensions = [
        { name: 'Redux DevTools', id: 'lmhkpmbekcpmknklioeibfkpmmfibljd' },
    ];

    app.once('ready', () => {
        const userDataPath = environment.getPath('userData');

        extensions.forEach((extension) => {
            installExtension(extension.id).then(() => {
                console.log(extension.name + ' installed in ' + userDataPath);
            }).catch(err => {
                console.error('Failed to install ' + extension.name, err);
            });
        });
    });
}
