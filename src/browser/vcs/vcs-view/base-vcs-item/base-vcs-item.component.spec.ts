import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { expectDom, fastTestSetup } from '../../../../../test/helpers';
import { VcsFileChange } from '../../../../core/vcs';
import { CheckboxComponent } from '../../../ui/checkbox';
import { UiModule } from '../../../ui/ui.module';
import { VcsFileChangeDummy } from '../../dummies';
import { VcsItemConfig, VcsItemRef, VcsItemUpdateCheckedEvent } from '../vcs-item';
import { BaseVcsItemComponent } from './base-vcs-item.component';


describe('browser.vcs.vcsView.BaseVcsItemComponent', () => {
    let fixture: ComponentFixture<BaseVcsItemComponent>;
    let component: BaseVcsItemComponent;

    let ref: VcsItemRef<BaseVcsItemComponent>;
    let config: VcsItemConfig;

    let fileChange: VcsFileChange;

    const getCheckboxInputEl = (): HTMLInputElement =>
        (fixture.debugElement.query(
            By.css('gd-checkbox')).componentInstance as CheckboxComponent
        )._inputElement.nativeElement;

    fastTestSetup();

    beforeAll(async () => {
        fileChange = new VcsFileChangeDummy().create();
        config = { fileChanges: [fileChange] };

        ref = new VcsItemRef(config);

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                ],
                declarations: [
                    BaseVcsItemComponent,
                ],
                providers: [
                    { provide: VcsItemRef, useValue: ref },
                    { provide: VcsItemConfig, useValue: config },
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BaseVcsItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('appearance', () => {
        it('should display checkbox label as file path of file change.', () => {
            const checkboxLabel = fixture.debugElement.query(
                By.css('.Checkbox__label'),
            ).nativeElement as HTMLElement;

            expectDom(checkboxLabel).toContainText(fileChange.filePath);
        });
    });

    describe('checkbox interaction', () => {
        it('should emit event when checkbox toggled.', () => {
            const callback = jasmine.createSpy('vcs item event callback');
            const subscription = ref.events.subscribe(callback);

            getCheckboxInputEl().click();

            expect(callback).toHaveBeenCalledWith(new VcsItemUpdateCheckedEvent(ref, { checked: true }));
            subscription.unsubscribe();
        });

        it('should ', () => {
            const callback = jasmine.createSpy('vcs item event callback');
            const subscription = ref.events.subscribe(callback);

            component.select(false);
            fixture.detectChanges();

            expect(component.checkFormControl.value as boolean).toBe(true);
            expect(getCheckboxInputEl().checked).toBe(true);
            expect(callback).not.toHaveBeenCalledWith(new VcsItemUpdateCheckedEvent(ref, {
                checked: true,
            }));
            subscription.unsubscribe();
        });

        it('should ', () => {
            const callback = jasmine.createSpy('vcs item event callback');
            const subscription = ref.events.subscribe(callback);

            component.deselect(false);
            fixture.detectChanges();

            expect(component.checkFormControl.value as boolean).toBe(false);
            expect(getCheckboxInputEl().checked).toBe(false);
            expect(callback).not.toHaveBeenCalledWith(new VcsItemUpdateCheckedEvent(ref, {
                checked: false,
            }));
            subscription.unsubscribe();
        });

        it('should ', () => {
            const callback = jasmine.createSpy('vcs item event callback');
            const subscription = ref.events.subscribe(callback);

            component.toggle(false);
            fixture.detectChanges();

            expect(component.checkFormControl.value as boolean).toBe(true);
            expect(getCheckboxInputEl().checked).toBe(true);
            expect(callback).not.toHaveBeenCalledWith(new VcsItemUpdateCheckedEvent(ref, {
                checked: true,
            }));
            subscription.unsubscribe();
        });
    });
});
