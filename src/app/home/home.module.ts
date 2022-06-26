import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component'; 

import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgDatePipesModule } from 'ngx-pipes';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';

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
    MatIconModule,
    FormsModule, ReactiveFormsModule,
    NgDatePipesModule,
    MatMenuModule,
    MatChipsModule
  ]
})
export class HomeModule { 
    constructor(private route: ActivatedRoute){}
}
