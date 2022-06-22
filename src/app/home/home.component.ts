import { Component, OnInit } from '@angular/core';
import {AbstractControl, Form, FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    title = 'Home'

    filePath: Blob
    filePrev: string | ArrayBuffer | null

    constructor() { }

    upload($event: any) {
        this.filePath = $event.target.files[0]

        const reader = new FileReader();
        reader.onload = e => this.filePrev = reader.result;

        reader.readAsDataURL(this.filePath)
    }

    ngOnInit(): void {
        console.log(`should be working`)
    }

}
