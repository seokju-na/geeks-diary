const { app } = require('electron');
const GeeksDiaryApp = require('./geeks-diary-app');


let geeksDiaryApp;

function bootstrap() {
    geeksDiaryApp = new GeeksDiaryApp();

    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception: ', error.toString());

        if (error.stack) {
            console.error(error.stack);
        }
    });

    geeksDiaryApp.on('error', () => {

    });

    app.once('ready', () => {
        geeksDiaryApp.run();
        console.log('bootstrap');
    });
}

module.exports = bootstrap;
