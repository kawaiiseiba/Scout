
import { NgModule } from '@angular/core';
import { ApplyUserDialog, OrganizationComponent } from './organization.component';

import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

const routes: Routes = [
	{
		path: '', component: OrganizationComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'list'
            },
            {
                path: 'list',
                pathMatch: 'full'
            },
            {
                path: 'create',
                pathMatch: 'full'
            }
        ]
	}
];

@NgModule({
    declarations: [OrganizationComponent, ApplyUserDialog],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      MatButtonModule,
      MatInputModule,
      MatIconModule,
      MatTabsModule,
      MatListModule,
      MatBadgeModule,
      MatTooltipModule,
      MatExpansionModule,
      MatMenuModule,
      FormsModule,
      ReactiveFormsModule,
      MatDialogModule
    ]
})
export class OrganizationModule { 
    constructor(private route: ActivatedRoute){}
}