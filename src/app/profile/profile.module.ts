import { NgModule } from '@angular/core';
import { ProfileComponent } from './profile.component';

import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
	{
		path: '', component: ProfileComponent, pathMatch: 'full'
	}
];

@NgModule({
    declarations: [ProfileComponent],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      MatButtonModule,
      MatInputModule,
      MatIconModule
    ]
})

export class ProfileModule { 
}
