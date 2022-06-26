import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PostsService } from '../services/posts.service';
import { Likes, Posts, PostClarity, User, Games } from '../services/models/data.model';
import { BehaviorSubject, concatMap, map, mergeMap, Observable, of, Subscription, switchMap, take, takeUntil } from 'rxjs';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    title = 'Home'

    @ViewChild('file') fileInput: ElementRef;
    filePath: Blob
    filePrev: string | ArrayBuffer | null

    posts$: Posts[]

    constructor(
        private db: AngularFirestore,
        public global: DashboardComponent,
        private postRef: PostsService,
        private auth: AuthService,
    ) { 

        this.auth.user$.pipe(take(1)).subscribe(user => {
            this.postRef.posts.valueChanges().pipe(
                switchMap(x => {
                    return of(
                        x.map(post => {
                            this.db.collection('users').doc<User>(post.user).valueChanges()
                            .pipe(
                                take(1),
                                switchMap(x => of(x))
                            ).subscribe(user => {
                                post.userRef$ = user
                            })

                            this.db.doc<Likes>('likes/'+post.pid+'_'+user?.uid).valueChanges()
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
                        .filter(x => x.contentFrom === global._routeURL)
                        .sort((a, b) => Number(b.date) - Number(a.date))
                    )
                })
            ).subscribe(data => {
                this.posts$ = data
            })
        })
    }

    isDisable = true
    isPosting = false
    description: string

    postIdentity(index: number, post: Posts) {
        return post.pid
    }

    upload($event: any) {
        this.filePath = $event.target.files[0]

        const reader = new FileReader();
        reader.onload = e => this.filePrev = reader.result;

        reader.readAsDataURL(this.filePath)
    }

    postContent() {
        const content = {
            attachment: this.filePrev ? this.filePath : undefined,
            description: this.description
        }
        this.postRef.createPost(content).then(data => {
            this.isPosting = false
            this.description = ''
            this.filePrev = ''
            this.fileInput.nativeElement.value = ''
        })
    }

    likeUnlikePost(id: string){
        this.postRef.likeUnlike(id)
    }

    async ngOnInit() {
    }

    ngOnDestroy(): void {
    }
}
