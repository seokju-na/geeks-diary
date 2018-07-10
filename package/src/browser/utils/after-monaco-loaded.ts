export function afterMonacoLoaded(): Promise<any> {
    const targetWindow: any = <any>window;

    return new Promise((resolve) => {
        if (targetWindow.MONACO) {
            resolve(targetWindow.MONACO);
        } else {
            targetWindow.REGISTER_MONACO_INIT_CALLBACK(() => {
                resolve(targetWindow.MONACO);
            });
        }
    });
}
