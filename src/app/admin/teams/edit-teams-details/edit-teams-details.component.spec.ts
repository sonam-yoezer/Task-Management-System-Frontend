import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTeamsDetailsComponent } from './edit-teams-details.component';

describe('EditTeamsDetailsComponent', () => {
  let component: EditTeamsDetailsComponent;
  let fixture: ComponentFixture<EditTeamsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTeamsDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditTeamsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
