const env = require('./env');

const RUN_TARGET = process.env.RUN_TARGET;
let config;

switch (RUN_TARGET) {
    case 'production':
        config = require('./config.prod');
        break;
    case 'development':
    default:
        config = require('./config.dev');
        break;
}

env.init(config);

const bootstrap = require('./bootstrap');

bootstrap();
