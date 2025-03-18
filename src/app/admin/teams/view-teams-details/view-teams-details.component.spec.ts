import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTeamsDetailsComponent } from './view-teams-details.component';

describe('ViewTeamsDetailsComponent', () => {
  let component: ViewTeamsDetailsComponent;
  let fixture: ComponentFixture<ViewTeamsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTeamsDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewTeamsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
