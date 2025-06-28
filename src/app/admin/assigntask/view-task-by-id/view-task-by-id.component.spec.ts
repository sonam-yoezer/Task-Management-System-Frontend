import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTaskByIdComponent } from './view-task-by-id.component';

describe('ViewTaskByIdComponent', () => {
  let component: ViewTaskByIdComponent;
  let fixture: ComponentFixture<ViewTaskByIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTaskByIdComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewTaskByIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
