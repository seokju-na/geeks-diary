import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinderComponent } from './finder.component';

describe('FinderComponent', () => {
  let component: FinderComponent;
  let fixture: ComponentFixture<FinderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
