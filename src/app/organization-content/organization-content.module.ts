import { NgModule } from '@angular/core';
import { OrganizationContentComponent } from './organization-content.component';

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

const routes: Routes = [
	{
		path: '', component: OrganizationContentComponent,
        children:[
            {
                path: 'events',
                pathMatch: 'full'
            },
            {
                path: 'chat',
                pathMatch: 'full'
            },
            {
                path: 'members',
                pathMatch: 'full'
            },
            {
                path: 'jobs',
                pathMatch: 'full'
            },
        ]
    }
];

@NgModule({
    declarations: [OrganizationContentComponent],
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
      NgDatePipesModule
    ]
})
export class OrganizationContentModule { 
    constructor(private route: ActivatedRoute){}
}