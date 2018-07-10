import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';


export const tooltipAnimations: {
    readonly tooltipState: AnimationTriggerMetadata;
} = {
    tooltipState: trigger('state', [
        state('initial, void, hidden', style({ visibility: 'hidden' })),
        state('visible', style({ visibility: 'visible' })),
        transition('* => visible',
            animate('150ms cubic-bezier(0.0, 0.0, 0.2, 1)')),
        transition('* => hidden',
            animate('150ms cubic-bezier(0.4, 0.0, 1, 1)')),
    ]),
};
