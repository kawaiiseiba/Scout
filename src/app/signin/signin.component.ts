import { Component, OnInit } from '@angular/core';
import {AbstractControl, Form, FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';

import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || isSubmitted));
    }
}

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

    title = 'Scout | Signin';
    emailFormControl = new FormControl('', [Validators.required, Validators.email]);
    passwordFormControl = new FormControl('', [Validators.required, Validators.pattern(/.{8}.*/i)]);

    constructor(
		private titleService: Title, 
		private route: ActivatedRoute, 
		public _router: Router
	) {}

    isPasswordRevealed = false

    matcher = new MyErrorStateMatcher();

    ngOnInit(): void {
        document.title = this.title
    }
}
