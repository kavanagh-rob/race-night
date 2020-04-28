import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveOddsComponent } from './live-odds.component';

describe('LiveOddsComponent', () => {
  let component: LiveOddsComponent;
  let fixture: ComponentFixture<LiveOddsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveOddsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveOddsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
