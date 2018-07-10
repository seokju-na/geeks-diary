export enum PlatformTypes {
    DARWIN = 'DARWIN',
    WIN32 = 'WIN_32',
    LINUX = 'LINUX',
}


const platformTypeMap = {
    darwin: PlatformTypes.DARWIN,
    win32: PlatformTypes.WIN32,
    linux: PlatformTypes.LINUX,
};


export function platformMatches(...types: PlatformTypes[]): boolean {
    let included = false;

    for (const type of Object.keys(platformTypeMap)) {
        if (types.includes(platformTypeMap[type])) {
            included = true;
            break;
        }
    }

    return included;
}


export const __DARWIN__ = process.platform === 'darwin';
export const __WIN32__ = process.platform === 'win32';
export const __LINUX__ = process.platform === 'linux';
