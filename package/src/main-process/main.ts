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

app.once('ready', async () => {
    try {
        await appDelegate.run();
        console.log('START! 😸');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
});
