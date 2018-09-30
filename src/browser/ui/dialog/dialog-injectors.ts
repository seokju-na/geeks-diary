import { BlockScrollStrategy, Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';


export const DIALOG_DATA = new InjectionToken<any>('DialogData');

export const DIALOG_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>('DialogScrollStrategy');

export function DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay): () => BlockScrollStrategy {
    return () => overlay.scrollStrategies.block();
}

// noinspection JSUnusedGlobalSymbols
export const DIALOG_SCROLL_STRATEGY_PROVIDER = {
    provide: DIALOG_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY,
};
