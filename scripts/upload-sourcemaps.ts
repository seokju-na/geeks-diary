import * as path from 'path';
import * as rimraf from 'rimraf';
import { promisify } from 'util';
import { spawnAsync } from './utils';


const PROD = process.env.NODE_ENV === 'production';
const ROOT_DIR = path.resolve(__dirname, '../');
const ORG_NAME = 'geeks-diary';
const PROJECT_NAME = PROD ? 'geeks-diary-production' : 'geeks-diary-dev';
const release = require('../src/package.json').version;

const rimrafAsync = promisify(rimraf);


async function uploadSourcemaps(): Promise<void> {
    await spawnAsync('sentry-cli', [
        'releases',
        '-o',
        ORG_NAME,
        '-p',
        PROJECT_NAME,
        'new',
        release,
    ], { cwd: ROOT_DIR });

    await spawnAsync('sentry-cli', [
        'releases',
        '-o',
        ORG_NAME,
        '-p',
        PROJECT_NAME,
        'files',
        release,
        'upload-sourcemaps',
        '--rewrite',
        '--url-prefix',
        '/browser/app',
        './tmp/browser/app',
    ], { cwd: ROOT_DIR });

    await spawnAsync('sentry-cli', [
        'releases',
        '-o',
        ORG_NAME,
        '-p',
        PROJECT_NAME,
        'files',
        release,
        'upload-sourcemaps',
        '--rewrite',
        '--url-prefix',
        '/browser/wizard',
        './tmp/browser/wizard',
    ], { cwd: ROOT_DIR });

    await spawnAsync('sentry-cli', [
        'releases',
        '-o',
        ORG_NAME,
        '-p',
        PROJECT_NAME,
        'files',
        release,
        'upload-sourcemaps',
        '--rewrite',
        '--url-prefix',
        '/main-process',
        './tmp/main.js.map',
    ], { cwd: ROOT_DIR });

    await rimrafAsync(path.resolve(ROOT_DIR, 'tmp/'));
}


(async (): Promise<void> => {
    await uploadSourcemaps();
})()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
