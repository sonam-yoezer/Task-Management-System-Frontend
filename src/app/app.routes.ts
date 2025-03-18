import { Routes } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { UserdashboardComponent } from './user/userdashboard/userdashboard.component';
import { AdmindashboardComponent } from './admin/admindashboard/admindashboard.component';
import { ViewProfileComponent } from './admin/profile/view-profile/view-profile.component';
import { EditProfileComponent } from './admin/profile/edit-profile/edit-profile.component';
import path from 'path';
import { ViewUserProfileComponent } from './user/profile/view-user-profile/view-user-profile.component';
import { EditUserProfileComponent } from './user/profile/edit-user-profile/edit-user-profile.component';
import { ViewTeamsDetailsComponent } from './admin/teams/view-teams-details/view-teams-details.component';
import { EditTeamsDetailsComponent } from './admin/teams/edit-teams-details/edit-teams-details.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'login', component: LoginComponent },

    {
        path: 'user/dashboard',
        component: UserdashboardComponent,
        children: [
            {
                path: 'view/user/profile',
                component: ViewUserProfileComponent,
                children: [
                    {
                        path: 'edit',
                        component: EditUserProfileComponent
                    },
                ]
            }
        ]
    },

    {
        path: 'admin/dashboard',
        component: AdmindashboardComponent,
        children: [
            {
                path: 'view/profile',
                component: ViewProfileComponent,
                children: [
                    {
                        path: 'edit',
                        component: EditProfileComponent
                    },
                ]
            },
            {
                path: 'view/teams',
                component: ViewTeamsDetailsComponent,
                children: [
                    {
                        path: 'edit',
                        component: EditTeamsDetailsComponent
                    },
                ]
            }
        ],
    },

];
