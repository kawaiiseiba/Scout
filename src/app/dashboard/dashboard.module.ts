import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';  

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';

const routes: Routes = [
	{
		path: '', component: DashboardComponent,
        children: [
            {
                path: 'home',
                loadChildren: () => import('../home/home.module').then(m => m.HomeModule),
                pathMatch: 'full'
            },
            {
                path: 'organization',
                loadChildren: () => import('../organization/organization.module').then(m => m.OrganizationModule),
                pathMatch: 'full'
            },
            {
                path: 'jobs',
                loadChildren: () => import('../jobs/jobs.module').then(m => m.JobsModule),
                pathMatch: 'full'
            },
            {
                path: 'teams',
                loadChildren: () => import('../teams/teams.module').then(m => m.TeamsModule),
                pathMatch: 'full'
            },
            {
                path: ':username',
                loadChildren: () => import('../profile/profile.module').then(m => m.ProfileModule)
            },
        ]
	}
];

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSidenavModule,
    MatMenuModule,
    MatRippleModule,
    MatExpansionModule,
    MatProgressBarModule
  ]
})
export class DashboardModule { }
