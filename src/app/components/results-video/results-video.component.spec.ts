import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsVideoComponent } from './results-video.component';

describe('ResultsVideoComponent', () => {
  let component: ResultsVideoComponent;
  let fixture: ComponentFixture<ResultsVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultsVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
