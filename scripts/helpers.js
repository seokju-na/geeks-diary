const path = require('path');


const ROOT_PATH = path.resolve(__dirname, '../');

const helpers = {
    path: {
        root(...paths) {
            return path.resolve(ROOT_PATH, ...paths);
        },

        src(...paths) {
            return path.resolve(ROOT_PATH, 'src/', ...paths);
        },

        dist(...paths) {
            return path.resolve(ROOT_PATH, 'dist/', ...paths);
        },

        excludes() {
            return [/node_modules/, /dist/, /assets/];
        }
    },

    runTarget: {
        getName() {
            return process.env.RUN_TARGET || 'development';
        },

        isTargetAvailable(name) {
            return ['production', 'development', 'test'].includes(name);
        }
    }
};

module.exports = helpers;
