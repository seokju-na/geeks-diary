declare var process: any;


export function isRendererProcess() {
    return process && process.type === 'renderer';
}
