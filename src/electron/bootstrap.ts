import { app } from 'electron';

import { appDelegate } from './app-delegate';
import './dev-extensions';
import './globals';


process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception: ', error.toString());

    if (error.stack) {
        console.error(error.stack);
    }
});

app.commandLine.appendSwitch('remote-debugging-port', '9229');

app.once('ready', () => {
    appDelegate.run();
    console.log('START! 😸');
});
