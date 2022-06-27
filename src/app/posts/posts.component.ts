import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, NavigationEnd, Route, Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { filter, Observable, of, switchMap, take } from 'rxjs';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AuthService } from '../services/auth.service';
import { Comments, Games, Likes, Posts, User } from '../services/models/data.model';
import { PostsService } from '../services/posts.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

    post: Posts
    comments$: Observable<Comments[]>

    previousUrl: string | undefined

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private db: AngularFirestore,
        public global: DashboardComponent,
        private postRef: PostsService,
        private auth: AuthService
    ) {
        this.previousUrl = this.router.getCurrentNavigation()?.previousNavigation?.finalUrl?.toString()

        const postId = this.activatedRoute.snapshot.params['id']

        this.auth.user$.pipe(take(1)).subscribe(user => {
            this.db.doc<Posts>('posts/'+postId).valueChanges().subscribe(
                data => {
                    if(!data) return
    
                    this.comments$ = this.db.collection<Comments>('comments', ref => ref.where('reference', '==', data?.pid).orderBy('date','desc')).valueChanges()
                    .pipe(
                        switchMap(x => of(x.map(comment => {
                            this.db.collection('users').doc<User>(comment?.user).valueChanges()
                            .pipe(
                                take(1),
                                switchMap(x => of(x))
                            ).subscribe(user => {
                                comment.userRef$ = user
                            })
            
                            this.db.doc<Likes>('likes/'+data.pid+'_'+comment?.cid).valueChanges()
                            .pipe(
                                switchMap(x => of(x))
                            ).subscribe(likes => {
                                comment.likeRef$ = likes
                            })

                            return comment
                        })))
                    )
    
                    this.db.collection('users').doc<User>(data?.user).valueChanges()
                    .pipe(
                        take(1),
                        switchMap(x => of(x))
                    ).subscribe(user => {
                        data.userRef$ = user
                    })
    
                    this.db.doc<Likes>('likes/'+data.pid+'_'+user?.uid).valueChanges()
                    .pipe(
                        take(1),
                        switchMap(x => of(x))
                    ).subscribe(likes => {
                        data.likeRef$ = likes
                    })
    
                    this.db.collection<Games>('games', ref => ref.where('baseURL', '==', data.contentFrom)).valueChanges()
                    .pipe(
                        take(1),
                        switchMap(x => of(...x.map(x => x)))
                    ).subscribe(game => {
                        data.gameRef$ = game!
                    })

                    this.post = data
                }
            )
        })

        
        
    }

    toDate(timestamp: number){
        return moment(new Date(timestamp)).format('h:mm A · MMM D, YYYY')
    }

    identity(index: number, comment: Comments) {
        return comment.cid
    }

    prevLocation() {
        if(this.previousUrl === undefined || this.previousUrl === this.router.url) return this.router.navigate(['/'+this.global._routeURL+'/home'])
        return this.router.navigate([this.previousUrl])
    }

    likeUnlikePost(id: string){
        this.postRef.likeUnlike(id)
    }

    likeUnlikeComment(pid: string | undefined, cid: string | undefined){
        if(pid === undefined|| cid === undefined) return
        this.postRef.likeUnlikeComment(pid, cid)
    }

    ngOnInit(): void {
    }

}
