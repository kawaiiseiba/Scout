import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent, NavigationEnd, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    subloader: boolean

    constructor(router: Router) {
        this.subloader = false

        router.events.subscribe((event): void => {
            if (event instanceof NavigationStart) {
                this.subloader = true
            } else if (event instanceof NavigationEnd) {
                this.subloader = false
            }
        });
    }

    ngOnInit() {
    }

}