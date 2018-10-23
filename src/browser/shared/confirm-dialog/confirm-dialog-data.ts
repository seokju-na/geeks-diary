export class ConfirmDialogData {
    title?: string;
    body: string;
    isAlert?: boolean = false;

    alertButtonString?: string = 'Ok';
    confirmButtonString?: string = 'Ok';
    cancelButtonString?: string = 'Cancel';
}
