import { NgModule } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';
import { SignupComponent } from './signup.component';
import { CommonModule } from '@angular/common';  

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';

const routes: Routes = [
	{
		path: '', component: SignupComponent, pathMatch: 'full'
	}
];


@NgModule({
    declarations: [SignupComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatButtonModule,
        MatButtonToggleModule,
        MatInputModule,
        MatIconModule,
        FormsModule, ReactiveFormsModule,
        TextFieldModule
    ]
})
export class SignupModule { }
