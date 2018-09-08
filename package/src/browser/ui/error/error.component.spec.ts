import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expectDebugElement } from '../../../../test/helpers/expect-debug-element';
import { fastTestSetup } from '../../../../test/helpers/fast-test-setup';
import { ErrorComponent } from './error.component';


describe('browser.ui.ErrorComponent', () => {
    let component: ErrorComponent;
    let fixture: ComponentFixture<ErrorComponent>;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                declarations: [ErrorComponent],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ErrorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should element to be visible when \'show\' value set to true.', () => {
        component.show = true;
        fixture.detectChanges();

        expectDebugElement(fixture.debugElement).toBeDisplayed();
        expectDebugElement(fixture.debugElement).toContainClasses('Error--show');
    });

    it('should element to be hidden when \'show\' value set to false.', () => {
        component.show = false;
        fixture.detectChanges();

        expectDebugElement(fixture.debugElement).not.toBeDisplayed();
        expectDebugElement(fixture.debugElement).not.toContainClasses('Error--show');
    });
});
