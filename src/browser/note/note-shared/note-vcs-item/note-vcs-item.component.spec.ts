import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { createDummies, fastTestSetup } from '../../../../../test/helpers';
import { VcsFileChange } from '../../../../core/vcs';
import { CheckboxComponent } from '../../../ui/checkbox';
import { UiModule } from '../../../ui/ui.module';
import { VcsFileChangeDummy } from '../../../vcs/dummies';
import { VcsItemConfig, VcsItemRef, VcsItemUpdateCheckedEvent } from '../../../vcs/vcs-view';
import { NoteVcsItemComponent } from './note-vcs-item.component';


describe('browser.note.noteShared.NoteVcsItemComponent', () => {
    let fixture: ComponentFixture<NoteVcsItemComponent>;
    let component: NoteVcsItemComponent;

    let ref: VcsItemRef<NoteVcsItemComponent>;
    let config: VcsItemConfig;
    let fileChanges: VcsFileChange[];

    const getCheckboxInputEl = (): HTMLInputElement =>
        (fixture.debugElement.query(
                By.css('gd-checkbox')).componentInstance as CheckboxComponent
        )._inputElement.nativeElement;

    fastTestSetup();

    beforeAll(async () => {
        fileChanges = createDummies(new VcsFileChangeDummy(), 2);
        config = { fileChanges };
        ref = new VcsItemRef(config);

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                ],
                declarations: [
                    NoteVcsItemComponent,
                ],
                providers: [
                    { provide: VcsItemRef, useValue: ref },
                    { provide: VcsItemConfig, useValue: config },
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NoteVcsItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('appearance', () => {
        it('should ho_ho_ho', () => {
        });
    });

    describe('checkbox interactive', () => {
        it('should emit event when checkbox toggled.', () => {
            const callback = jasmine.createSpy('vcs item event callback');
            const subscription = ref.events.subscribe(callback);

            getCheckboxInputEl().click();

            expect(callback).toHaveBeenCalledWith(new VcsItemUpdateCheckedEvent(ref, { checked: true }));
            subscription.unsubscribe();
        });

        it('1', () => {
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

        it('1', () => {
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
    });
});
