import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppShellComponent } from './app-shell.component';


describe('app.AppShellComponent', () => {
    let fixture: ComponentFixture<AppShellComponent>;
    let component: AppShellComponent;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                declarations: [AppShellComponent]
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppShellComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be defined', () => {
        expect(fixture).toBeDefined();
    });
});
