import { NgModule } from '@angular/core';
import { LandingComponent, NewsDialog, SigninSignupDialog } from './landing.component';

import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';


const routes: Routes = [
	{
		path: '', component: LandingComponent
	}
];

@NgModule({
    declarations: [LandingComponent, NewsDialog, SigninSignupDialog],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      MatButtonModule,
      MatInputModule,
      MatIconModule,
      MatMenuModule,
      MdbCarouselModule,
      MatDialogModule,
      MatButtonToggleModule,
      FormsModule, ReactiveFormsModule,
      TextFieldModule
    ],
    providers: [LandingComponent]
})

export class LandingModule {
    constructor(private route: ActivatedRoute){}
}