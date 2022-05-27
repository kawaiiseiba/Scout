import { NgModule } from '@angular/core';
import { ExploreComponent } from './explore.component';

import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
	{
		path: '', component: ExploreComponent
	}
];

@NgModule({
    declarations: [ExploreComponent],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      MatButtonModule,
      MatInputModule,
      MatIconModule
    ]
})
export class ExploreModule { 
    constructor(private route: ActivatedRoute){}
}