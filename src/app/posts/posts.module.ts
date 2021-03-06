import { NgModule } from '@angular/core';
import { PostsComponent } from './posts.component';

import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { NgDatePipesModule } from 'ngx-pipes';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

const routes: Routes = [
	{
		path: '', component: PostsComponent, pathMatch: 'full'
	}
];

@NgModule({
    declarations: [PostsComponent],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      MatButtonModule,
      MatInputModule,
      MatIconModule,
      NgDatePipesModule,
      MatChipsModule,
      MatMenuModule
    ]
})

export class PostsModule { 
}
