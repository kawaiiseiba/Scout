
import { NgModule } from '@angular/core';
import { OrganizationComponent } from './organization.component';

import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
	{
		path: '', component: OrganizationComponent
	}
];

@NgModule({
    declarations: [OrganizationComponent],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      MatButtonModule,
      MatInputModule,
      MatIconModule
    ]
})
export class OrganizationModule { 
    constructor(private route: ActivatedRoute){}
}