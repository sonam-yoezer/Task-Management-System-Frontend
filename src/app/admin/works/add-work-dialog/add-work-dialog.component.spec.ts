import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWorkDialogComponent } from './add-work-dialog.component';

describe('AddWorkDialogComponent', () => {
  let component: AddWorkDialogComponent;
  let fixture: ComponentFixture<AddWorkDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWorkDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddWorkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
