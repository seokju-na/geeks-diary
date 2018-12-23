import * as Builder from 'electron-builder';
import { copy, ensureDir, readdir, readJson, remove } from 'fs-extra';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { promisify } from 'util';
import { spawnAsync } from './utils';


const ROOT_PATH = path.resolve(__dirname, '../');
const SRC_PATH = path.resolve(ROOT_PATH, 'src/');
const TMP_PATH = path.resolve(ROOT_PATH, 'tmp/');
const DIST_PATH = path.resolve(ROOT_PATH, 'dist/');
const BUILD_PATH = path.resolve(ROOT_PATH, 'build/');

const rimrafAsync = promisify(rimraf);

interface PackageInfo {
    name: string;
    productName: string;
    appId: string;
    version: string;
    description: string;
    repository: {
        url: string;
    };
    author: {
        name: string;
        email: string;
    };
    license: string;
}


async function distribute(): Promise<void> {
    console.log('Remove distribution directory.');
    await remove(DIST_PATH);

    console.log('Start distribute.');

    // Run all build.
    await Promise.all([
        spawnAsync('yarn', [
            'run',
            'build:browser:app',
        ], { cwd: ROOT_PATH }),
        spawnAsync('yarn', [
            'run',
            'build:browser:wizard',
        ], { cwd: ROOT_PATH }),
        spawnAsync('yarn', [
            'run',
            'build:main-process',
        ], { cwd: ROOT_PATH }),
    ]);

    console.log('Move source maps to tmp directory.');

    const moveSourceMaps = async (dirName: string): Promise<void> => {
        const fileNames = await readdir(path.resolve(DIST_PATH, dirName));
        const sourceMapFileNames = fileNames.filter(
            fileName => /.js.map$/.test(fileName),
        );

        await ensureDir(path.resolve(TMP_PATH, dirName));

        const tasks: Promise<void>[] = [];

        sourceMapFileNames.forEach((sourceMapFileName) => {
            tasks.push(copy(
                path.resolve(DIST_PATH, dirName, sourceMapFileName),
                path.resolve(TMP_PATH, dirName, sourceMapFileName),
            ));
        });

        await Promise.all(tasks);
    };

    await moveSourceMaps('browser/app');
    await moveSourceMaps('browser/wizard');

    console.log('Remove all source maps');
    await rimrafAsync('dist/browser/app/*.map');
    await rimrafAsync('dist/browser/wizard/*.map');

    console.log('End distribute.');
}


async function installDependenciesOnDist(): Promise<void> {
    console.log('Copy package.json');
    await copy(
        path.resolve(SRC_PATH, 'package.json'),
        path.resolve(DIST_PATH, 'package.json'),
        { overwrite: true },
    );

    console.log('Install dependencies.');
    await spawnAsync('yarn', ['install'], { cwd: DIST_PATH });

    console.log('Rebuild native modules.');
    await spawnAsync('npx', [
        'electron-rebuild',
        '-m',
        'dist/',
    ], { cwd: ROOT_PATH });

    console.log('Optimize nodegit.');
    await remove(path.resolve(DIST_PATH, 'node_modules/nodegit/vendor'));

    console.log('Remove yarn.lock');
    await remove(path.resolve(DIST_PATH, 'yarn.lock'));

    console.log('Prune node modules.');
    await spawnAsync('npm', ['prune', '--production'], { cwd: DIST_PATH });
}


async function build(): Promise<void> {
    console.log('Remove build directory.');
    await remove(BUILD_PATH);

    const packageInfo: PackageInfo = await readJson(
        path.resolve(DIST_PATH, 'package.json'),
        { throws: true },
    );

    console.log('Build started...');
    await Builder.build({
        config: {
            appId: packageInfo.appId,
            productName: packageInfo.productName,
            buildVersion: packageInfo.version,
            asar: true,
            npmRebuild: false,
            directories: {
                app: DIST_PATH,
                output: BUILD_PATH,
            },
            mac: {
                category: 'public.app-category.developer-tools',
                darkModeSupport: true,
                icon: path.resolve(SRC_PATH, 'assets/logos/icon-logo.icns'),
            },
            extraMetadata: {
                name: packageInfo.name,
                description: packageInfo.description,
                license: packageInfo.license,
                author: packageInfo.author,
                repository: packageInfo.repository,
            },
        },
    });
}


(async (): Promise<void> => {
    console.log('1. Distribute');
    await distribute();

    console.log('2. Install Dependencies on Dist');
    await installDependenciesOnDist();

    console.log('3. Build');
    await build();
})()
    .then(() => process.exit(1))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
