import { ComponentType, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Location } from '@angular/common';
import { ComponentRef, Inject, Injectable, Injector, Optional, SkipSelf } from '@angular/core';
import { defer, Observable, Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { DialogConfig } from './dialog-config';
import { DialogContainerComponent } from './dialog-container.component';
import { DIALOG_DATA, DIALOG_SCROLL_STRATEGY } from './dialog-injectors';
import { DialogRef } from './dialog-ref';


@Injectable()
export class Dialog {
    get _afterAllClosed(): Observable<void> {
        return this.parentDialog
            ? this.parentDialog.afterAllClosed
            : this._afterAllClosedBase;
    }

    _afterOpened: Subject<DialogRef<any>> = new Subject();

    get afterOpened(): Subject<DialogRef<any>> {
        return this.parentDialog
            ? this.parentDialog.afterOpened
            : this._afterOpened;
    }

    _openDialogs: DialogRef<any>[] = [];

    get openDialogs(): DialogRef<any>[] {
        return this.parentDialog
            ? this.parentDialog.openDialogs
            : this._openDialogs;
    }

    afterAllClosed: Observable<void> = defer<void>(() =>
        this.openDialogs.length
            ? this._afterAllClosed
            : this._afterAllClosed.pipe(startWith(undefined)),
    );

    private _afterAllClosedBase = new Subject<void>();

    constructor(
        private overlay: Overlay,
        private injector: Injector,
        @Inject(DIALOG_SCROLL_STRATEGY) private scrollStrategy,
        @Optional() @SkipSelf() private parentDialog: Dialog,
        @Optional() location: Location,
    ) {

        // Close all of the dialogs when the user goes forwards/backwards in history or when the
        // location hash changes. Note that this usually doesn't include clicking on links (unless
        // the user is using the `HashLocationStrategy`).
        if (!parentDialog && location) {
            location.subscribe(() => this.closeAll());
        }
    }

    getById(id: string): DialogRef<any> | undefined {
        return this._openDialogs.find(ref => ref.id === id);
    }

    closeAll(): void {
        this.openDialogs.forEach(ref => ref.close());
    }

    /**
     * Opens a dialog from a component.
     * Description about generics:
     *  T : Component type.
     *  D : Dialog data interface.
     *  R : Dialog result interface.
     *
     * @param component
     * @param config
     */
    open<T, D = any, R = any>(component: ComponentType<T>, config?: DialogConfig<D>): DialogRef<T, R> {
        config = this._applyConfigDefaults(config);

        if (config.id && this.getById(config.id)) {
            throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
        }

        const overlayRef = this.createOverlay(config);
        const dialogContainer = this.attachDialogContainer(overlayRef, config);
        const dialogRef = this.attachDialogContentForComponent<T>(
            component,
            dialogContainer,
            overlayRef,
            config,
        );

        this.registerDialogRef(dialogRef);

        return dialogRef;
    }

    /**
     * Creates an overlay config from a dialog config.
     * @param config The dialog configuration.
     * @returns The overlay configuration.
     */
    protected createOverlay(config: DialogConfig): OverlayRef {
        const overlayConfig = new OverlayConfig({
            positionStrategy: this.overlay.position().global(),
            scrollStrategy: this.scrollStrategy(),
            backdropClass: ['DialogBackdrop'],
            hasBackdrop: config.hasBackdrop,
            minWidth: config.minWidth,
            minHeight: config.minHeight,
            maxWidth: config.maxWidth,
            maxHeight: config.maxHeight,
            width: config.width,
            height: config.height,
        });

        return this.overlay.create(overlayConfig);
    }

    /**
     * Attaches an DialogContainerComponent to a dialog's already-created overlay.
     * @param overlay Reference to the dialog's underlying overlay.
     * @param config The dialog configuration.
     */
    protected attachDialogContainer(overlay: OverlayRef, config: DialogConfig): DialogContainerComponent {
        const injector = new PortalInjector(this.injector, new WeakMap([
            [DialogConfig, config],
        ]));
        const containerPortal = new ComponentPortal(DialogContainerComponent, undefined, injector);
        const containerRef: ComponentRef<DialogContainerComponent> = overlay.attach(containerPortal);
        containerRef.instance.config = config;

        return containerRef.instance;
    }

    /**
     * Attaches the user-provided component to the already-created DialogContainerComponent.
     * @param component The type of component being loaded into the dialog.
     * @param dialogContainer Reference to the wrapping DialogContainerComponent.
     * @param overlayRef Reference to the overlay in which the dialog resides.
     * @param config The dialog configuration.
     */
    protected attachDialogContentForComponent<T>(
        component: ComponentType<T>,
        dialogContainer: DialogContainerComponent,
        overlayRef: OverlayRef,
        config: DialogConfig,
    ): DialogRef<any> {

        // Create a reference to the dialog we're creating in apply to give the user a handle
        // to modify and close it.
        const dialogRef = new DialogRef<T>(overlayRef, dialogContainer, config.id) as DialogRef<T>;

        const injector = this.createInjector<T>(config, dialogRef, dialogContainer);
        const contentRef = dialogContainer.attachComponentPortal(
            new ComponentPortal(component, undefined, injector),
        );

        dialogRef.componentInstance = contentRef.instance;
        dialogRef
            .updateSize({ width: config.width, height: config.height })
            .updatePosition(config.position);

        return dialogRef;
    }

    /**
     * Forwards emitting events for when dialogs are opened and all dialogs are closed.
     * @param dialogRef
     */
    private registerDialogRef(dialogRef: DialogRef<any>): void {
        this.openDialogs.push(dialogRef);

        const dialogOpenSub = dialogRef.afterOpened().subscribe(() => {
            this.afterOpened.next(dialogRef);
            dialogOpenSub.unsubscribe();
        });

        const dialogCloseSub = dialogRef.afterClosed().subscribe(() => {
            const dialogIndex = this._openDialogs.indexOf(dialogRef);

            if (dialogIndex > -1) {
                this._openDialogs.splice(dialogIndex, 1);
            }

            if (!this._openDialogs.length) {
                this._afterAllClosedBase.next();
                dialogCloseSub.unsubscribe();
            }
        });
    }

    /**
     * Creates a custom injector to be used inside the dialog. This allows a component loaded inside
     * of a dialog to close itself and, optionally, to return a value.
     * @param config Configuration object that is used to construct the dialog.
     * @param dialogRef Reference to the dialog.
     * @param dialogContainer Dialog container element that wraps all of the contents.
     */
    private createInjector<T>(
        config: DialogConfig,
        dialogRef: DialogRef<T>,
        dialogContainer: DialogContainerComponent,
    ): PortalInjector {

        const injectionTokens = new WeakMap<any, any>([
            [DialogRef, dialogRef],
            [DialogContainerComponent, dialogContainer],
            [DIALOG_DATA, config.data],
        ]);

        return new PortalInjector(this.injector, injectionTokens);
    }

    private _applyConfigDefaults(config?: DialogConfig): DialogConfig {
        return { ...new DialogConfig(), ...config };
    }

}
