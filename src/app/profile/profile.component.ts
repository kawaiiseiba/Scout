import { Component, OnInit } from '@angular/core';

import { RouterModule, Routes, ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(
		private titleService: Title, 
		private route: ActivatedRoute, 
		public _router: Router
  ) { }

  ngOnInit(): void {
      console.log(this.route.snapshot.params['id'])
  }

}
