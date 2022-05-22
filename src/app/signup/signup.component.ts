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
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit{

    title = 'Scout | Signup';
    emailFormControl = new FormControl('', [Validators.required, Validators.email]);
    passwordFormControl = new FormControl('', [Validators.required, Validators.pattern(/^(?!.*\s)(?=.*\d)(?=.*[A-Z])(.{8}.*)$/i)]);

    constructor(
		private titleService: Title, 
		private route: ActivatedRoute, 
		public _router: Router
	) {}

    isPasswordRevealed = false

    revealPassword = () =>{
        this.isPasswordRevealed = !this.isPasswordRevealed
    }

    nonWhiteSpace = (val: string) => {
        return /^\S+$/g.test(val)
    }

    oneNumeric = (val: string) => {
        return /^.*\d.*$/g.test(val)
    }

    oneUppercase = (val: string) => {
        return /^.*[A-Z].*$/g.test(val)
    }

    atleastEight = (val: string) => {
        return /^.{8}.*$/g.test(val)
    }


    matcher = new MyErrorStateMatcher();

    ngOnInit(): void {
        document.title = this.title
    }
}
