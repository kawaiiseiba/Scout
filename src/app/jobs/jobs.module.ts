import { NgModule } from '@angular/core';
import { JobsComponent } from './jobs.component';

import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
	{
		path: '', component: JobsComponent
	}
];

@NgModule({
    declarations: [JobsComponent],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      MatButtonModule,
      MatInputModule,
      MatIconModule
    ]
})

export class JobsModule {
    constructor(private route: ActivatedRoute){}
}