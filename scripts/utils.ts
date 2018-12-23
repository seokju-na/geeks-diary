import { spawn, SpawnOptions } from 'child_process';


export function spawnAsync(command: string, args?: string[], options?: SpawnOptions): Promise<any> {
    const task = spawn(command, args, options);

    return new Promise((resolve, reject) => {
        task.stdout.setEncoding('utf8');
        task.stderr.setEncoding('utf8');

        let result = '';

        task.stdout.on('data', data => result += data);
        task.stderr.on('data', data => console.error(data.toString()));

        task.on('close', (code) => {
            if (code === 0) {
                resolve(result);
            } else {
                reject();
            }
        });
    });
}
