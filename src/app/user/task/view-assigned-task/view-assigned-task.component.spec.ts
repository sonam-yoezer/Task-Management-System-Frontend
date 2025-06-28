import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAssignedTaskComponent } from './view-assigned-task.component';

describe('ViewAssignedTaskComponent', () => {
  let component: ViewAssignedTaskComponent;
  let fixture: ComponentFixture<ViewAssignedTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAssignedTaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAssignedTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
