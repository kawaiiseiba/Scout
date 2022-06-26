import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { RouterModule, Routes, ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { User } from '../services/models/data.model';
import { AuthService } from '../services/auth.service';
import { of, Subscription, switchMap, take, Timestamp } from 'rxjs';
import { AccountService } from '../services/account.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
    title = 'Profile'

    user: User | null | undefined
    profile: User | null | undefined

    $userSubscription: Subscription

    constructor(
        private titleService: Title, 
        public route: ActivatedRoute, 
        public _router: Router,
        public global: DashboardComponent,
        private auth: AuthService,
        private account: AccountService
    ) { 
        this.$userSubscription = this.auth.user$.subscribe(userAuthenticated => {
            this.user = userAuthenticated
            this.account.getAccountByUsername(this.route.snapshot.params['username']).pipe(take(1), switchMap(x => of(...x.map(user => user))))
            .subscribe(data => {
                this.profile = userAuthenticated?.uid === data.uid ? userAuthenticated : data
            })
        })
        
    }

    dateJoined(date: number){
        return moment(new Date(date)).format("MMM Do YY")
    }

    ngOnInit(): void {
        console.log(this.user)
    }

    ngOnDestroy(): void {
        this.$userSubscription.unsubscribe()
    }
}
