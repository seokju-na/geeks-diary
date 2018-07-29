import { ComponentType, Overlay, OverlayConfig, OverlayContainer, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Inject, Injectable, InjectionToken, Injector, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
import { DialogConfig } from './dialog-config';
import { DialogContainerComponent } from './dialog-container.component';
import { DialogRef } from './dialog-ref';


export const DIALOG_DATA = new InjectionToken<any>('DialogData');

export const DIALOG_DEFAULT_OPTIONS = new InjectionToken<DialogConfig>('DialogDefaultOptions');


@Injectable({
    providedIn: 'root',
})
export class Dialog {
    private _openDialogsAtThisLevel: DialogRef<any>[] = [];
    private readonly _afterAllClosedAtThisLevel = new Subject<void>();
    private readonly _afterOpenAtThisLevel = new Subject<DialogRef<any>>();
    private _ariaHiddenElements = new Map<Element, string | null>();

    get openDialogs(): DialogRef<any>[] {
        return this._parentDialog ? this._parentDialog.openDialogs : this._openDialogsAtThisLevel;
    }

    get afterOpen(): Subject<DialogRef<any>> {
        return this._parentDialog ? this._parentDialog.afterOpen : this._afterOpenAtThisLevel;
    }

    constructor(
        private _overlay: Overlay,
        private _injector: Injector,
        @Optional() @Inject(DIALOG_DEFAULT_OPTIONS) private _defaultOptions,
        @Optional() @SkipSelf() private _parentDialog: Dialog,
        private _overlayContainer: OverlayContainer,
    ) {
    }

    open<T, D = any, R = any>(
        component: ComponentType<T>,
        config?: DialogConfig<D>,
    ): DialogRef<T, R> {

        config = _applyConfigDefaults(config, this._defaultOptions || new DialogConfig());

        const overlayRef = this._createOverlay(config);
        const dialogContainer = this._attachDialogContainer(overlayRef, config);
        const dialogRef = this._attachDialogContent<T, R>(
            component,
            dialogContainer,
            overlayRef,
            config,
        );

        // If this is the first dialog that we're opening, hide all the non-overlay content.
        if (!this.openDialogs.length) {
            this._hideNonDialogContentFromAssistiveTechnology();
        }

        this.openDialogs.push(dialogRef);
        dialogRef.afterClosed().subscribe(() => this._removeOpenDialog(dialogRef));
        this.afterOpen.next(dialogRef);

        return dialogRef;
    }

    private _createOverlay(config: DialogConfig): OverlayRef {
        const overlayConfig = this._getOverlayConfig(config);
        return this._overlay.create(overlayConfig);
    }

    private _getOverlayConfig(dialogConfig: DialogConfig): OverlayConfig {
        const positionStrategy = this._overlay.position().global()
            .centerHorizontally()
            .centerVertically();

        return new OverlayConfig({
            positionStrategy,
            scrollStrategy: this._overlay.scrollStrategies.block(),
            hasBackdrop: dialogConfig.hasBackdrop,
            minWidth: dialogConfig.minWidth,
            minHeight: dialogConfig.minHeight,
            maxWidth: dialogConfig.maxWidth,
            maxHeight: dialogConfig.maxHeight,
            width: dialogConfig.width,
            height: dialogConfig.height,
        });
    }

    private _attachDialogContainer(
        overlay: OverlayRef,
        config: DialogConfig,
    ): DialogContainerComponent {

        const injector = new PortalInjector(this._injector, new WeakMap([
            [DialogConfig, config],
        ]));
        const containerPortal = new ComponentPortal(DialogContainerComponent, null, injector);
        const containerRef = overlay.attach<DialogContainerComponent>(containerPortal);

        return containerRef.instance;
    }

    private _attachDialogContent<T, R>(
        component: ComponentType<T>,
        dialogContainer: DialogContainerComponent,
        overlayRef: OverlayRef,
        config: DialogConfig,
    ): DialogRef<T, R> {

        // Create a reference to the dialog we're creating in order to give the user a handle
        // to modify and close it.
        const dialogRef = new DialogRef<T, R>(overlayRef, dialogContainer, config.id);

        // When the dialog backdrop is clicked, we want to close it.
        if (config.hasBackdrop) {
            overlayRef.backdropClick().subscribe(() => {
                if (!dialogRef.disableBackdropClickClose) {
                    dialogRef.close();
                }
            });
        }

        const injector = this._createInjector<T>(config, dialogRef, dialogContainer);
        const contentRef = dialogContainer.attachComponentPortal<T>(
            new ComponentPortal(component, undefined, injector));
        dialogRef.componentInstance = contentRef.instance;

        return dialogRef;
    }

    private _createInjector<T>(
        config: DialogConfig,
        dialogRef: DialogRef<T>,
        dialogContainer: DialogContainerComponent,
    ): PortalInjector {

        // The MatDialogContainer is injected in the portal as the MatDialogContainer and the dialog's
        // content are created out of the same ViewContainerRef and as such, are siblings for injector
        // purposes. To allow the hierarchy that is expected, the MatDialogContainer is explicitly
        // added to the injection tokens.
        const injectionTokens = new WeakMap<any, any>([
            [DialogContainerComponent, dialogContainer],
            [DIALOG_DATA, config.data],
            [DialogRef, dialogRef],
        ]);

        return new PortalInjector(this._injector, injectionTokens);
    }

    private _removeOpenDialog(dialogRef: DialogRef<any>): void {
        const index = this.openDialogs.indexOf(dialogRef);

        if (index > -1) {
            this.openDialogs.splice(index, 1);

            // If all the dialogs were closed, remove/restore the `aria-hidden`
            // to a the siblings and emit to the `afterAllClosed` stream.
            if (!this.openDialogs.length) {
                this._ariaHiddenElements.forEach((previousValue, element) => {
                    if (previousValue) {
                        element.setAttribute('aria-hidden', previousValue);
                    } else {
                        element.removeAttribute('aria-hidden');
                    }
                });

                this._ariaHiddenElements.clear();
            }
        }
    }

    private _hideNonDialogContentFromAssistiveTechnology() {
        const overlayContainer = this._overlayContainer.getContainerElement();

        // Ensure that the overlay container is attached to the DOM.
        if (overlayContainer.parentElement) {
            const siblings = overlayContainer.parentElement.children;

            for (let i = siblings.length - 1; i > -1; i--) {
                const sibling = siblings[i];

                if (sibling !== overlayContainer &&
                    sibling.nodeName !== 'SCRIPT' &&
                    sibling.nodeName !== 'STYLE' &&
                    !sibling.hasAttribute('aria-live')) {

                    this._ariaHiddenElements.set(sibling, sibling.getAttribute('aria-hidden'));
                    sibling.setAttribute('aria-hidden', 'true');
                }
            }
        }
    }
}


function _applyConfigDefaults(
    config?: DialogConfig,
    defaultOptions?: DialogConfig,
): DialogConfig {

    return { ...defaultOptions, ...config };
}
