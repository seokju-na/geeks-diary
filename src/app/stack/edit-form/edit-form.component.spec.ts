import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createDummyList } from '../../../testing/dummy';
import { MonacoService } from '../../core/monaco.service';
import { SharedModule } from '../../shared/shared.module';
import { StackChipComponent } from '../chip/chip.component';
import { StackDummyFactory } from '../dummies';
import { Stack } from '../models';
import { StackViewer } from '../stack-viewer';
import { StackEditFormComponent } from './edit-form.component';


describe('app.stack.editForm.StackEditFormComponent', () => {
    let fixture: ComponentFixture<TestStackEditFormComponent>;
    let component: TestStackEditFormComponent;

    const validateStacks = (stacks: Stack[]): void => {
        const editForm = fixture.debugElement.query(By.directive(StackEditFormComponent));
        const stackItemEls = editForm.queryAll(By.css('.StackEditForm__stackItem'));

        expect(stackItemEls.length).toEqual(stacks.length);

        stackItemEls.forEach((stackItemEl, index) => {
            const chip = stackItemEl.query(By.directive(StackChipComponent));
            const name = stackItemEl.query(By.css('span'));
            const stack = stacks[index];

            // If stack has no icon, should not display stack chip.
            if (stack.icon) {
                expect((<StackChipComponent>chip.componentInstance).stack).toEqual(stack);
            } else {
                expect(chip).toBeNull();
            }

            expect(name.nativeElement.textContent).toContain(stack.name);
        });
    };

    const getInputEl = (): HTMLInputElement => {
        const editForm = fixture.debugElement.query(By.directive(StackEditFormComponent));

        return editForm.query(By.css('.StackEditForm__input > input')).nativeElement;
    };

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
                    NoopAnimationsModule,
                ],
                providers: [
                    MonacoService,
                    StackViewer,
                ],
                declarations: [
                    StackChipComponent,
                    StackEditFormComponent,
                    TestStackEditFormComponent,
                ],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestStackEditFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should stacks items are placed when stacks value input.', () => {
        const stacks = createDummyList(new StackDummyFactory(), 3);

        component.stacks = [...stacks];
        fixture.detectChanges();

        validateStacks(stacks);
    });
});


@Component({
    template: `
        <gd-stack-edit-form [stacks]="stacks"
                            (stacksChanged)="updateStacks($event)"></gd-stack-edit-form>
    `,
})
class TestStackEditFormComponent {
    stacks: Stack[] = [];

    updateStacks(stacks: Stack[]): void {
        this.stacks = stacks;
    }
}
