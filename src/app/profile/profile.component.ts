import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { RouterModule, Routes, ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { Games, Likes, Posts, User } from '../services/models/data.model';
import { AuthService } from '../services/auth.service';
import { of, Subscription, switchMap, take, Timestamp } from 'rxjs';
import { AccountService } from '../services/account.service';
import * as moment from 'moment-timezone';
import { PostsService } from '../services/posts.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
    title = 'Profile'

    user: User | null | undefined
    profile: User | null | undefined

    posts: Posts[]

    constructor(
        private titleService: Title, 
        public route: ActivatedRoute, 
        public _router: Router,
        public global: DashboardComponent,
        private auth: AuthService,
        private account: AccountService,
        private postRef: PostsService,
        private db: AngularFirestore
    ) { 
        this.auth.user$.pipe(take(1)).subscribe(userAuthenticated => {
            this.user = userAuthenticated
            this.account.getAccountByUsername(this.route.snapshot.params['username']).pipe(take(1), switchMap(x => of(...x.map(user => user))))
            .subscribe(data => {
                this.profile = userAuthenticated?.uid === data.uid ? userAuthenticated : data

                this.db.collection<Posts>('posts', ref => ref.where('user', '==', this.profile?.uid)).valueChanges()
                .pipe(
                    switchMap(x => {
                        return of(x.map(post => {
                            this.db.collection('users').doc<User>(post.user).valueChanges()
                            .pipe(
                                take(1),
                                switchMap(x => of(x))
                            ).subscribe(user => {
                                post.userRef$ = user
                            })

                            this.db.doc<Likes>('likes/'+post.pid+'_'+post.user).valueChanges()
                            .pipe(
                                take(1),
                                switchMap(x => of(x))
                            ).subscribe(likes => {
                                post.likeRef$ = likes
                            })

                            this.db.collection<Games>('games', ref => ref.where('baseURL', "==", post.contentFrom).limit(1)).valueChanges()
                            .pipe(
                                take(1),
                                switchMap(x => of(...x.map(x => x)))
                            ).subscribe(games => {
                                post.gameRef$ = games
                            })
                            return post
                        })
                        .sort((a, b) => Number(b.date) - Number(a.date)))
                    })
                ).subscribe(data => {
                    this.posts = data
                })
            })
        })
        
    }

    postIdentity(index: number, post: Posts) {
        return post.pid
    }

    likeUnlikePost(id: string){
        this.postRef.likeUnlike(id)
    }

    dateJoined(date: number){
        return moment(new Date(date)).format("MMM Do YY")
    }

    ngOnInit(): void {
        console.log(this.user)
    }

    ngOnDestroy(): void {
    }
}
