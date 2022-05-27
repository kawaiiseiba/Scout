import { NgModule } from '@angular/core';
import { TeamsComponent } from './teams.component';

import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
	{
		path: '', component: TeamsComponent
	}
];

@NgModule({
    declarations: [TeamsComponent],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      MatButtonModule,
      MatInputModule,
      MatIconModule
    ]
})

export class TeamsModule {
    constructor(private route: ActivatedRoute){}
}
