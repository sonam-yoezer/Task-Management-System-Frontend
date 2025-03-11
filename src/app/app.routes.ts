import { Routes } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { UserdashboardComponent } from './user/userdashboard/userdashboard.component';
import { AdmindashboardComponent } from './admin/admindashboard/admindashboard.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'login', component: LoginComponent },

    {
        path: 'user/dashboard',
        component: UserdashboardComponent,
    },

    {
        path: 'admin/dashboard',
        component: AdmindashboardComponent,
    },

];
