import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, PortalInjector } from '@angular/cdk/portal';
import { ComponentRef, Injectable, InjectionToken, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { DialogConfig } from './dialog-config';
import { DialogContainerComponent } from './dialog-container.component';
import { DialogRef } from './dialog-ref';


export const DIALOG_DATA = new InjectionToken<any>('DialogData');


@Injectable()
export class Dialog {
    private openDialogs: DialogRef<any>[] = [];
    private readonly afterAllClosed = new Subject<void>();
    private readonly afterOpen = new Subject<DialogRef<any>>();

    constructor(private injector: Injector, private overlay: Overlay) {
    }

    open<T, D = any, R = any>(
        component: ComponentType<T>,
        config?: Partial<DialogConfig<D>>,
    ): DialogRef<T, R> {

        const concatConfig: DialogConfig<D> = { ...new DialogConfig(), ...config };

        const overlayRef = this.createOverlay(concatConfig);
        const dialogContainer = this.attachDialogContainer(overlayRef, concatConfig);
        const dialogRef = this.attachDialogContent<T, R>(
            component,
            dialogContainer,
            overlayRef,
            concatConfig);

        this.openDialogs.push(dialogRef);
        dialogRef.afterClosed().subscribe(() => this.removeOpenDialog(dialogRef));
        this.afterOpen.next(dialogRef);

        return dialogRef;
    }

    private createOverlay(config: DialogConfig): OverlayRef {
        const overlayConfig = this.getOverlayConfig(config);
        return this.overlay.create(overlayConfig);
    }

    private getOverlayConfig(config: DialogConfig): OverlayConfig {
        return new OverlayConfig({
            positionStrategy: this.overlay.position().global(),
            scrollStrategy: this.overlay.scrollStrategies.block(),
            hasBackdrop: config.hasBackdrop,
            minWidth: config.minWidth,
            minHeight: config.minHeight,
            maxWidth: config.maxWidth,
            maxHeight: config.maxHeight,
        });
    }

    private attachDialogContainer(
        overlay: OverlayRef,
        config: DialogConfig,
    ): DialogContainerComponent {

        const containerPortal = new ComponentPortal(DialogContainerComponent);
        const containerRef: ComponentRef<DialogContainerComponent> =
            overlay.attach(containerPortal);

        containerRef.instance._config = config;

        return containerRef.instance;
    }

    private attachDialogContent<T, R>(
        component: ComponentType<T>,
        dialogContainer: DialogContainerComponent,
        overlayRef: OverlayRef,
        config: DialogConfig,
    ): DialogRef<T, R> {

        const dialogRef = new DialogRef<T, R>(overlayRef, dialogContainer);

        // When the dialog backdrop is clicked, we want to close it.
        if (config.hasBackdrop) {
            overlayRef.backdropClick().subscribe(() => {
                if (!config.disableClose) {
                    dialogRef.close();
                }
            });
        }

        const injector = this.createInjector<T>(config, dialogRef);
        const contentRef = dialogContainer.attachComponentPortal<T>(
            new ComponentPortal(component, undefined, injector));

        dialogRef.componentInstance = contentRef.instance;
        dialogRef
            .updateSize(config.width, config.height)
            .updatePosition(config.position);

        return dialogRef;
    }

    private createInjector<T>(
        config: DialogConfig,
        dialogRef: DialogRef<T>,
    ): PortalInjector {

        const injectionTokens = new WeakMap();

        injectionTokens
            .set(DIALOG_DATA, config.data)
            .set(DialogRef, dialogRef);


        return new PortalInjector(this.injector, injectionTokens);
    }

    private removeOpenDialog(dialogRef: DialogRef<any>) {
        const index = this.openDialogs.indexOf(dialogRef);

        if (index > -1) {
            this.openDialogs.splice(index, 1);
        }
    }

}
