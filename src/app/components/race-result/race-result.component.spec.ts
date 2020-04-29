import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceResultComponent } from './race-result.component';

describe('RaceResultComponent', () => {
  let component: RaceResultComponent;
  let fixture: ComponentFixture<RaceResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RaceResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaceResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
