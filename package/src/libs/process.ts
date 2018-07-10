declare var process: any;


export function isRendererProcess(): boolean {
    return process && process.type === 'renderer';
}
