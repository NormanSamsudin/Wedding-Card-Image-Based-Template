import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RSVP } from './rsvp';

describe('Rsvp', () => {
  let component: RSVP;
  let fixture: ComponentFixture<RSVP>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RSVP]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RSVP);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
