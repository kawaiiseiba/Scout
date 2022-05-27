import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component'; 

import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
	{
		path: '', component: HomeComponent
	}
];

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatInputModule,
    MatIconModule
  ]
})
export class HomeModule { 
    constructor(private route: ActivatedRoute){}
}
