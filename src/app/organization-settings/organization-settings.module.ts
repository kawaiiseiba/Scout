import { NgModule } from '@angular/core';
import { AddRoleDialog, OrganizationSettingsComponent, PositionSettingsDialog, RoleSettingsDialog } from './organization-settings.component';

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
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatChipsModule } from '@angular/material/chips';
import { NgDatePipesModule } from 'ngx-pipes';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

const routes: Routes = [
	{
		path: '', component: OrganizationSettingsComponent,
        children: [
            {
                path: 'positions',
                pathMatch: 'full'
            },
            {
                path: 'roles',
                pathMatch: 'full'
            },
        ]
    }
];

@NgModule({
    declarations: [OrganizationSettingsComponent, PositionSettingsDialog, RoleSettingsDialog, AddRoleDialog],
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
      ClipboardModule,
      MatChipsModule,
      NgDatePipesModule,
      MatDatepickerModule,
      DragDropModule,
      MatDialogModule,
      MatSlideToggleModule
    ]
})
export class OrganizationSettingsModule { 
    constructor(private route: ActivatedRoute){}
}