import { Component, NgModule } from '@angular/core';


@Component({
    template: 'NOOP',
})
export class NoopComponent {
}


@NgModule({
    declarations: [NoopComponent],
    exports: [NoopComponent],
})
export class NoopModule {
}
