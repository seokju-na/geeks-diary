import { app } from 'electron';
import { environment } from '../core/environment';
import { logMonitor } from '../core/log-monitor';
import { appDelegate } from './app-delegate';
import './dev-extensions';


process.on('uncaughtException', (error) => {
    appDelegate.preventQuit = true;

    logMonitor.logException(error);
    console.error('Uncaught Exception: ', error.toString());

    if (error.stack) {
        console.error(error.stack);
    }
});


if (!environment.production) {
    app.commandLine.appendSwitch('remote-debugging-port', '9229');
}


logMonitor.install('main-process');


app.once('ready', async () => {
    try {
        await appDelegate.run();
        console.log('START! 🤔');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
});
