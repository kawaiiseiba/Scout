import { NgModule } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';
import { NotfoundComponent } from './notfound/notfound.component';

const routes: Routes = [
	{
        path: '',
        loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule),
        pathMatch: 'full',
    },
	{
		path: '', 
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
	},
	{
		path: 'error/404', 
        component: NotfoundComponent,
        pathMatch: 'full'
	},
    {
        path: '**',
        redirectTo: 'error/404'
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
