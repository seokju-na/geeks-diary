import * as fs from 'fs';


export async function readFile(filename: string): Promise<Buffer> {
    const readFileAsync: Promise<Buffer> = new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data: Buffer) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

    return readFileAsync;
}

export async function readdir(pathname: string): Promise<Array<string>> {
    const readdirAsync: Promise<Array<string>> = new Promise((resolve, reject) => {
        fs.readdir(pathname, (err, files: Array<string>) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });

    return readdirAsync;
}

export async function writeFile(filename: string, data: string): Promise<any> {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export async function isPathExists(pathname: string): Promise<boolean> {
    const accessAsync: Promise<boolean> = new Promise((resolve, reject) => {
        fs.access(pathname, (err) => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });

    return accessAsync;
}
