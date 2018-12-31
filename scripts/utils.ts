(<any>Symbol).asyncIterator = Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator');


import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { spawn, SpawnOptions } from 'child_process';


/**
 * Async wrapper for 'child_process.spawn'
 * @param command
 * @param args
 * @param options
 */
export function spawnAsync(command: string, args?: string[], options?: SpawnOptions): Promise<any> {
    const task = spawn(command, args, options);

    return new Promise((resolve, reject) => {
        task.stdout.setEncoding('utf8');
        task.stderr.setEncoding('utf8');

        task.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject();
            }
        });
    });
}


export type EachApiCallNextApiUrlParser = (response: AxiosResponse) => string | null;


export interface EachApiCallOptions {
    requestConfig?: AxiosRequestConfig;
    nextApiUrlParser: EachApiCallNextApiUrlParser;
}


/**
 * Simple async iterator for handle api pages.
 * @param startUrl
 * @param options
 */
export async function* eachApiCalls<T>(
    startUrl: string,
    options: EachApiCallOptions,
): AsyncIterableIterator<T> {
    let nextApiUrl = startUrl;

    do {
        const response = await axios.get(nextApiUrl, options.requestConfig);
        yield response.data;

        nextApiUrl = options.nextApiUrlParser(response);
    } while (nextApiUrl !== null);
}
