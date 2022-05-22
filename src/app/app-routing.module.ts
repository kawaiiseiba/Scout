import { NgModule } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';

import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
	{
		path: '', component: SigninComponent, pathMatch: 'full'
	},
	{
		path: 'signup', component: SignupComponent, pathMatch: 'full'
	},
	{
		path: 'home', component: DashboardComponent, pathMatch: 'full'
	}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { 
    constructor( private route: ActivatedRoute ){}
    ngOnInit() {
		
	}
}
