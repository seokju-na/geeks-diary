import './globals';
import { app } from 'electron';
import { appDelegate } from './app-delegate';
import './dev-extensions';


process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception: ', error.toString());

    if (error.stack) {
        console.error(error.stack);
    }
});

app.commandLine.appendSwitch('remote-debugging-port', '9229');

app.once('ready', () => {
    appDelegate.init();
    appDelegate.run();
    console.log('START! 😸');
});
