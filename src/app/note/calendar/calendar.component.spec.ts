import { DatePipe } from '@angular/common';
import { Component, DebugElement } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { datetime, DateUnits } from '../../../common/datetime';
import { expectDebugElement } from '../../../testing/validation';
import { SharedModule } from '../../shared/shared.module';
import {
    NoteCalendarComponent,
    NoteContributeTable,
    NoteContributionLevel,
} from './calendar.component';


describe('app.note.calendar.NoteCalendarComponent', () => {
    let fixture: ComponentFixture<TestNoteCalendarComponent>;
    let component: TestNoteCalendarComponent;

    let datePipe: DatePipe;

    const validateCalendarTitle = (indexDate: Date): void => {
        const calendar = fixture.debugElement.query(
            By.directive(NoteCalendarComponent));
        const titleEl = calendar.query(By.css('.NoteCalendar__title > h1'));

        expect(titleEl.nativeElement.innerText)
            .toContain(datePipe.transform(indexDate, 'MMM yyyy'));
    };

    const validateDateCell = (
        date: Date,
        statusToBe: 'blank' | 'selected' | 'none',
        contributionLevelToBe?: NoteContributionLevel,
    ): DebugElement => {

        const calendar = fixture.debugElement.query(
            By.directive(NoteCalendarComponent));
        const datetimeAttribute = datetime.shortFormat(date);
        const cellEl = calendar.query(
            By.css(`.NoteCalendar__cell[datetime="${datetimeAttribute}"]`));

        if (!cellEl) {
            throw new Error(`Cannot find calendar cell element: ${datetimeAttribute}`);
        }

        switch (statusToBe) {
            case 'blank':
                expectDebugElement(cellEl)
                    .toContainsClass('NoteCalendar__cell--blank');
                break;

            case 'selected':
                expectDebugElement(cellEl)
                    .toContainsClass('NoteCalendar__cell--selected');
                break;
        }

        if (contributionLevelToBe) {
            const className =
                `NoteCalendar__cell--contributionLevel-${contributionLevelToBe}`;

            expectDebugElement(cellEl).toContainsClass(className);
        }

        return cellEl;
    };

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
                ],
                providers: [
                    DatePipe,
                ],
                declarations: [
                    NoteCalendarComponent,
                    TestNoteCalendarComponent,
                ],
            })
            .compileComponents();
    }));

    beforeEach(inject(
        [DatePipe],
        (d: DatePipe) => {
            datePipe = d;
        },
    ));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestNoteCalendarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should render table when index date reference updated.', () => {
        component.indexDate = new Date();
        fixture.detectChanges();

        const target = new Date();
        target.setDate(15);

        validateCalendarTitle(new Date());
        validateDateCell(target, 'none');
    });

    it('should increase be disabled when today is at current month.', () => {
        component.indexDate = datetime.today();
        fixture.detectChanges();

        const rightNavButton = fixture.debugElement.query(
            By.css('button[aria-label=increase-month-button]'));

        expectDebugElement(rightNavButton).toBeDisabled();
    });

    it('should increase month when click right nav button.', () => {
        const indexDate = new Date();
        datetime.add(indexDate, DateUnits.MONTH, -1);

        component.indexDate = datetime.copy(indexDate);
        fixture.detectChanges();

        const rightNavButton = fixture.debugElement.query(
            By.css('button[aria-label=increase-month-button]'));

        rightNavButton.nativeElement.click();
        fixture.detectChanges();

        // Expect index month was increase by 1.
        datetime.add(indexDate, DateUnits.MONTH, 1);

        expect(datetime.isAtSameMonth(component.indexDate, indexDate)).toBe(true);

        // Sample date must be exists.
        const sampleDate = datetime.copy(indexDate);
        sampleDate.setDate(14);

        validateDateCell(sampleDate, 'none');
    });

    it('should decrease month when click left nav button.', () => {
        const indexDate = new Date();

        component.indexDate = datetime.copy(indexDate);
        fixture.detectChanges();

        const rightNavButton = fixture.debugElement.query(
            By.css('button[aria-label=decrease-month-button]'));

        rightNavButton.nativeElement.click();
        fixture.detectChanges();

        // Expect index month was decrease by 1.
        datetime.add(indexDate, DateUnits.MONTH, -1);

        expect(datetime.isAtSameMonth(component.indexDate, indexDate)).toBe(true);

        // Sample date must be exists.
        const sampleDate = datetime.copy(indexDate);
        sampleDate.setDate(14);

        validateDateCell(sampleDate, 'none');
    });

    it('should select date when click non selected date cell.', () => {
        component.indexDate = new Date();
        fixture.detectChanges();

        const target = new Date();
        target.setDate(13);

        const cellEl = validateDateCell(target, 'none');
        cellEl.triggerEventHandler('click', {});
        fixture.detectChanges();

        expect(datetime.isSameDay(component.selectedDate, target)).toBe(true);
        validateDateCell(target, 'selected');
    });

    it('should deselect date when click selected date cell.', () => {
        const target = new Date();
        target.setDate(13);

        component.indexDate = new Date();
        component.selectedDate = datetime.copy(target);
        fixture.detectChanges();

        const cellEl = validateDateCell(target, 'selected');
        cellEl.triggerEventHandler('click', {});
        fixture.detectChanges();

        expect(component.selectedDate).toEqual(null);
        validateDateCell(target, 'none');
    });

    it('should display contribution level.', () => {
        const target = new Date();
        target.setDate(17);

        const uid = datetime.shortFormat(target);
        const contributionTable: NoteContributeTable = {
            indexDate: new Date(),
            map: { [uid]: 0 },
        };

        component.indexDate = new Date();
        component.contributionTable = contributionTable;
        fixture.detectChanges();

        // Contribution level: 'none', if note count is 0
        component.contributionTable = {
            ...contributionTable,
            map: { [uid]: 0 },
        };
        fixture.detectChanges();

        validateDateCell(target, 'none', 'none');

        // Contribution level: 'low', if note count is 0-5
        component.contributionTable = {
            ...contributionTable,
            map: { [uid]: 3 },
        };
        fixture.detectChanges();

        validateDateCell(target, 'none', 'low');

        // Contribution level: 'medium', if note count is 5-10
        component.contributionTable = {
            ...contributionTable,
            map: { [uid]: 7 },
        };
        fixture.detectChanges();

        validateDateCell(target, 'none', 'medium');

        // Contribution level: 'none', if note count is at least 10
        component.contributionTable = {
            ...contributionTable,
            map: { [uid]: 12 },
        };
        fixture.detectChanges();

        validateDateCell(target, 'none', 'high');
    });
});


@Component({
    template: `
        <gd-note-calendar (changeIndexDate)="updateIndex($event)" 
                          (selectDate)="selectDate($event)"
                          [contributeTable]="contributionTable"
                          [indexDate]="indexDate" 
                          [selectedDate]="selectedDate"></gd-note-calendar>
    `,
})
class TestNoteCalendarComponent {
    indexDate: Date;
    selectedDate: Date | null = null;
    contributionTable: NoteContributeTable;

    updateIndex(date: Date): void {
        this.indexDate = date;
    }

    selectDate(selectedDate: Date | null): void {
        this.selectedDate = selectedDate;
    }
}
