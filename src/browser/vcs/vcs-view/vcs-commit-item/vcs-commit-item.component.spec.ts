import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { distanceInWordsToNow } from 'date-fns';
import { expectDom, fastTestSetup } from '../../../../../test/helpers';
import { VcsCommitItemDummy } from '../../../../core/dummies';
import { VcsCommitItem } from '../../../../core/vcs';
import { UiModule } from '../../../ui/ui.module';
import { VcsCommitItemComponent } from './vcs-commit-item.component';


describe('browser.vcs.vcsView.VcsCommitItemComponent', () => {
    let component: VcsCommitItemComponent;
    let fixture: ComponentFixture<VcsCommitItemComponent>;

    const commitItemDummy = new VcsCommitItemDummy();
    let commitItem: VcsCommitItem;

    let datePipe: DatePipe;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                ],
                declarations: [
                    VcsCommitItemComponent,
                ],
                providers: [
                    DatePipe,
                ],
                schemas: [NO_ERRORS_SCHEMA],
            })
            .compileComponents();
    });

    beforeEach(() => {
        commitItem = commitItemDummy.create();
        datePipe = TestBed.get(DatePipe);

        fixture = TestBed.createComponent(VcsCommitItemComponent);
        component = fixture.componentInstance;
        component.commitItem = commitItem;
    });

    it('should display summary, author name, created time diff.', () => {
        fixture.detectChanges();

        const de = fixture.debugElement;

        expectDom(de.query(By.css('.VcsCommitItem__summary')).nativeElement as HTMLElement)
            .toContainText(commitItem.summary);
        expectDom(de.query(By.css('.VcsCommitItem__author')).nativeElement as HTMLElement)
            .toContainText(commitItem.authorName);
        expectDom(de.query(By.css('.VcsCommitItem__createdAt')).nativeElement as HTMLElement)
            .toContainText(`committed ${distanceInWordsToNow(commitItem.timestamp)} ago`);
    });

    it('should create time diff has title attribute.', () => {
        fixture.detectChanges();

        const createdAtEl = fixture.debugElement.query(
            By.css('.VcsCommitItem__createdAt'),
        ).nativeElement as HTMLElement;

        expectDom(createdAtEl).toHaveAttribute(
            'title',
            datePipe.transform(commitItem.timestamp, 'medium'),
        );
    });

    it('should show details button exists if commit has description.', () => {
        component.commitItem.description = 'This is Description';
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('.VcsCommitItem__detailsButton'))).not.toBeNull();
    });

    it('should show details button not exists if commit has no description.', () => {
        component.commitItem.description = '';
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('.VcsCommitItem__detailsButton'))).toBeNull();
    });
});
