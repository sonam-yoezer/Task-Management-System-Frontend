import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitAssignedTaskComponent } from './submit-assigned-task.component';

describe('SubmitAssignedTaskComponent', () => {
  let component: SubmitAssignedTaskComponent;
  let fixture: ComponentFixture<SubmitAssignedTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitAssignedTaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubmitAssignedTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
