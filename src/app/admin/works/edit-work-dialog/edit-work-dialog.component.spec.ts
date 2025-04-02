import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWorkDialogComponent } from './edit-work-dialog.component';

describe('EditWorkDialogComponent', () => {
  let component: EditWorkDialogComponent;
  let fixture: ComponentFixture<EditWorkDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditWorkDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditWorkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
