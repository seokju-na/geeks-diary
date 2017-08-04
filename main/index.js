const env = require('./env');

const RUN_TARGET = process.env.RUN_TARGET;
let config;

switch (RUN_TARGET) {
    case 'production':
        config = require('./config.prod');
        break;
    case 'development':
        config = require('./config.dev');
        break;
    default: throw new Error('Invalid run target.');
}

env.init(config);

const bootstrap = require('./bootstrap');

bootstrap();
