const path = require('path');

const rootPath = path.resolve(__dirname, '../');

const env = {
    paths: {
        root: rootPath,
        renderer: {
            build: path.resolve(__dirname, '../renderer/build')
        }
    },

    init(config) {
        Object.keys(process.env).forEach((name) => {
            if (name in config) {
                process.env[name] = config[name];
            }
        });

        process.env.NODE_ENV = process.env.RUN_TARGET;
    },

    getConfig(name) {
        return process.env[name];
    }
};

module.exports = env;
