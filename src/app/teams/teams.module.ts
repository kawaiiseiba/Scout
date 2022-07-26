import { NgModule } from '@angular/core';
import { InviteMembersDialog, RostersDialog, TeamApplicants, TeamsComponent, ViewApplicationDialog } from './teams.component';

import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatChipsModule } from '@angular/material/chips';
import { NgDatePipesModule } from 'ngx-pipes';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';

const routes: Routes = [
	{
		path: '', component: TeamsComponent
	}
];

@NgModule({
    declarations: [TeamsComponent, InviteMembersDialog, RostersDialog, TeamApplicants, ViewApplicationDialog],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      MatButtonModule,
      MatInputModule,
      MatIconModule,
      MatListModule,
      MatBadgeModule,
      MatTooltipModule,
      MatMenuModule,
      FormsModule,
      ReactiveFormsModule,
      ClipboardModule,
      MatChipsModule,
      NgDatePipesModule,
      MatDatepickerModule,
      MatSlideToggleModule,
      MatRadioModule,
      MatDialogModule
    ]
})

export class TeamsModule {
    constructor(private route: ActivatedRoute){}
}
