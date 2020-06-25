import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouletteBetComponent } from './roulette-bet.component';

describe('RouletteBetComponent', () => {
  let component: RouletteBetComponent;
  let fixture: ComponentFixture<RouletteBetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouletteBetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouletteBetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
