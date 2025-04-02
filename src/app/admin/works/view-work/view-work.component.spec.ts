import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWorkComponent } from './view-work.component';

describe('ViewWorkComponent', () => {
  let component: ViewWorkComponent;
  let fixture: ComponentFixture<ViewWorkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWorkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
