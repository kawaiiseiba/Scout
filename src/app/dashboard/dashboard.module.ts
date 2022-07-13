import { NgModule } from '@angular/core';
import { AddProfileDialog, CommentDialog, DashboardComponent, EventCancelDialog, GameListDialog, PostDeleteDialog } from './dashboard.component';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';  

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { GameSelectGuard } from '../guard/game-select.guard';
import { NgDatePipesModule } from 'ngx-pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonToggle, MatButtonToggleModule } from '@angular/material/button-toggle';

const routes: Routes = [
	{
		path: ':game_url', component: DashboardComponent,
        canActivate: [GameSelectGuard],
        // canActivateChild: [GameSelectGuard],
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            },
            {
                path: 'home',
                loadChildren: () => import('../home/home.module').then(m => m.HomeModule),
                pathMatch: 'full'
            },
            {
                path: 'organization',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../organization/organization.module').then(m => m.OrganizationModule),
                    },
                    {
                        path: ':organization_id',
                        children: [
                            {
                                path: '',
                                loadChildren: () => import('../organization-content/organization-content.module').then(m => m.OrganizationContentModule)
                            },
                            {
                                path: 'settings',
                                loadChildren: () => import('../organization-settings/organization-settings.module').then(m => m.OrganizationSettingsModule)
                            },
                        ]
                    }
                ]
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
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../profile/profile.module').then(m => m.ProfileModule),
                        pathMatch: 'full',
                    },
                    {
                        path: 'posts/:id',
                        loadChildren: () => import('../posts/posts.module').then(m => m.PostsModule),
                        pathMatch: 'full',
                    },
                ]
            },
        ]
	}
];

@NgModule({
  declarations: [DashboardComponent, GameListDialog, EventCancelDialog, PostDeleteDialog, CommentDialog, AddProfileDialog],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSidenavModule,
    MatSelectModule,
    MatMenuModule,
    MatRippleModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    NgDatePipesModule,
    FormsModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatStepperModule,
    MatButtonToggleModule
  ],
  providers: [DashboardComponent],
})
export class DashboardModule { }
