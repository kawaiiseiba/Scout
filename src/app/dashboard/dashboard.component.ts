import { Component, OnInit, OnDestroy, Inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import {AbstractControl, Form, FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import { Router, RouterEvent, NavigationEnd, NavigationStart, ActivatedRoute } from '@angular/router';
import { Observable, of, Subscription, switchMap, take } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { GamesService } from '../services/games.service';
import { Comments, Games, Organization, PostClarity, Posts, Profile, Ranks, User } from '../services/models/data.model';
import { AuthService } from '../services/auth.service';
import { AccountService } from '../services/account.service';
import { PostsService } from '../services/posts.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    
    subloader: boolean
    hasActivity = true

    // selectedGame = 'option3'

    games: Games[]
    gameList$: Observable<Games[]>
    _routeURL: string

    user: User | null | undefined
    user$: Observable<User | null | undefined>

    gameSelectDialog$: MatDialogRef<GameListDialog>
    $gameSelectSubscription: Subscription

    gameProfile: Profile | null

    selectedGame: Games

    hasOrganization$: Observable<Organization | undefined>

    constructor(
        public router: Router,
        private activatedRoute: ActivatedRoute,
        private gameRef: GamesService,
        public dialog: MatDialog,
        private authRef: AuthService,
        private db: AngularFirestore
    ) {
        this.subloader = false

        router.events.subscribe((event): void => {
            if (event instanceof NavigationStart) {
                this.subloader = true
            } else if (event instanceof NavigationEnd) {
                this.subloader = false
            }
        });

        this.gameList$ = this.gameRef.gameArchive().valueChanges().pipe(
            switchMap(x => {
                return of(x.map(i => i))
            })
        )

        this.gameList$.subscribe(game => {
            this.games = game
        })

        this._routeURL = this.activatedRoute.snapshot.params['game_url']

        this.user$ = this.authRef.user$.pipe(
            take(1),
            switchMap(x => of(x))
        )

        this.user$.pipe(take(1)).subscribe(user=> {
            this.user = user

            this.gameRef.findByURL(this._routeURL).pipe(
                take(1),
                switchMap(x => {
                    return of(x.map(game => game)[0])
                })
            ).subscribe(game => {
                this.selectedGame = game

                if(!game) return

                this.hasOrganization$ = this.db.collection<Organization>('organizations').doc(game.id+'_'+user?.uid).valueChanges({ idField: 'oid'})
                .pipe(
                    take(1),
                    switchMap(x => {
                        if(x) return of(x)
                        return of(undefined)
                    })
                )
    
                this.db.collection<Profile>('profiles', ref => ref.where('gameRef', '==', game.id!).where('user', '==', user?.uid)).valueChanges()
                .pipe(
                    take(1),
                    switchMap(x => {
                        if(x.length > 0) return of(...x.map(x=>x))
                        return of(null)
                    })
                ).subscribe(profile => {
                    // if(profile === null) return this.addProfileDialog(game)
                    this.gameProfile = profile
                })
            })
        })

        


        this.openGameSelectDialog()
        
    }

    addProfileDialog(game: Games) {
        if(this.user === null && this.user === undefined) return

        this.dialog.open(AddProfileDialog, {
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel',
            width: '600px',
            position: {
                top: '50px'
            },
            data: game
        })
    }

    selectGame(url: string | undefined){
        try {
            window.location.href = './'+url+'/home'
        } catch (e) {
            console.log(e)
        }
    }

    openCommentDialog(post: PostClarity, user: User) {
        if(this.user === null && this.user === undefined) return

        this.dialog.open(CommentDialog, {
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel',
            width: '600px',
            position: {
                top: '50px'
            },
            data: {
                post: post,
                user: user,
                route: this.activatedRoute
            }
        })
    }

    openPostDeleteDialog(post: Posts) {
        if(this.user === null && this.user === undefined) return

        this.dialog.open(PostDeleteDialog, {
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel',
            width: '250px',
            data: {
                post: post
            }
        })
    }

    openGameSelectDialog() {
        if(this._routeURL !== 'game') return
        this.gameSelectDialog$ = this.dialog.open(GameListDialog, {
            width: '550px',
            // height: '650px',
            backdropClass: 'dark-backdrop',
            panelClass: 'game-list-container',
            disableClose: true
        })
    }

    onLogout(){
        this.authRef.logout()
        this.router.navigateByUrl('/')
    }

    abbrNum(number: any, decPlaces: number) {
        // 2 decimal places => 100, 3 => 1000, etc
        decPlaces = Math.pow(10,decPlaces);
    
        // Enumerate number abbreviations
        var abbrev = [ "k", "m", "b", "t" ];
    
        // Go through the array backwards, so we do the largest first
        for (var i=abbrev.length-1; i>=0; i--) {
    
            // Convert array index to "1000", "1000000", etc
            var size = Math.pow(10,(i+1)*3);
    
            // If the number is bigger or equal do the abbreviation
            if(size <= number) {
                 // Here, we multiply by decPlaces, round, and then divide by decPlaces.
                 // This gives us nice rounding to a particular decimal place.
                 number = Math.round(number*decPlaces/size)/decPlaces;
    
                 // Add the letter for the abbreviation
                 number += abbrev[i];
    
                 // We are done... stop
                 break;
            }
        }
    
        return number;
    }

    refDate(date: number){
        return new Date(date)
    }

    async ngOnInit() {
        const data: Games = {
            // icon: await this.gameRef.iconURL("Pt6RVNlDRVxieRbxI102"),
            // banner: await this.gameRef.bannerURL("Pt6RVNlDRVxieRbxI102"),
            baseURL: 'mobilelegends',
            // bgColor: '#231F1C',
            // textColor: '#CC911C',
            // publisher: 'Moonton Games',
            // name: 'Mobile Legends: Bang Bang',
            description: 'Mobile Legends is a 5v5 MOBA for handheld devices that offers a variety of playable heroes, game modes, and intense, fast-paced gameplay.',
            // ranks: new Map()
        }

        // this.gameRef.addGame(data)
        // this.gameRef.updateGameData(data, "I63118D0ZYusC3BNwxl0")

        // this.gameList$.forEach(console.log)
    }

    ngOnDestroy(): void {
        // this.$gameSelectSubscription?.unsubscribe()
    }
}

@Component({
    selector: 'game-list-dialog',
    templateUrl: './dialog/game-list.dialog.html',
    styleUrls: ['./dialog/game-list.dialog.scss']
})
export class GameListDialog {

    selectedGame: Games
    games: Games[]
    gameList$: Observable<Games[]>

    ign = new FormControl('', [Validators.required])
    bio = new FormControl('')

    constructor(
        private gameRef: GamesService,
        private authRef: AuthService,
        public global: DashboardComponent,
        private dialogRef: MatDialogRef<GameListDialog>
    ){
        this.gameList$ = this.gameRef.gameArchive().valueChanges().pipe(
            switchMap(x => {
                return of(x.map(i => i))
            })
        )

        this.gameList$.subscribe(game => {
            this.games = game
        })
    }
    
    isSelected = false
    stepperGameSelectName: string
    stepperGameSelectIcon: string
    stepperGameSelectUrl: string
    stepperGameSelectId: string
    activeUser: string

    saveGameProfile(ign: string, bio: string, rank: string, url: string){
        const data = <Profile>{
            ign: ign,
            bio: bio,
            rankRef: rank,
            user: this.activeUser,
            date: Date.now(),
            gameRef: this.stepperGameSelectId
        }
        this.gameRef.saveProfile(data)
        .then(() => {
            this.dialogRef.close()
            window.location.href = './'+url+'/home'
        })
    }

    gameSelected(value: any) {
        this.stepperGameSelectName = value.name
        this.stepperGameSelectIcon = value.icon
        this.stepperGameSelectUrl = value.url
        this.stepperGameSelectId = value.id
        this.activeUser = value.user
        this.isSelected = true
    }

    selectGame(url: string | undefined){
        try {
            window.location.href = './'+url+'/home'
        } catch (e) {
            console.log(e)
        }
    }
}

@Component({
    selector: 'post-delete-dialog',
    templateUrl: './dialog/post-delete.dialog.html',
    styleUrls: ['./dialog/post-delete.dialog.scss']
})

export class PostDeleteDialog {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { post: Posts, postId: string},
        private posts: PostsService
    ) {}

    confirmDelete(){
        this.posts.deletePost(this.data.post)
    }
}

@Component({
    selector: 'comment-dialog',
    templateUrl: './dialog/comment.dialog.html',
    styleUrls: ['./dialog/comment.dialog.scss']
})

export class CommentDialog {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private postRef: PostsService,
        private dialogRef: MatDialogRef<CommentDialog>
    ) {
    }

    @ViewChild('file') fileInput: ElementRef;
    filePath: Blob
    filePrev: string | ArrayBuffer | null

    posts$: Observable<PostClarity[]>
    $userSubscription: Subscription

    isDisable = true
    isPosting = false
    description: string

    postIdentity(index: number, post: Posts) {
        console.log(index)
        return post.pid
    }

    refDate(date: number){
        return new Date(date)
    }

    upload($event: any) {
        this.filePath = $event.target.files[0]

        const reader = new FileReader();
        reader.onload = e => this.filePrev = reader.result;

        reader.readAsDataURL(this.filePath)
    }

    addComment(id: string) {
        const content = <Comments>{
            attachment: this.filePrev ? this.filePath : undefined,
            description: this.description,
            reference: id,
            referenceType: 'posts'
        }
        this.postRef.createComment(content).then(data => {
            this.isPosting = false
            this.description = ''
            this.filePrev = ''
            this.fileInput.nativeElement.value = ''
            this.dialogRef.close()
        })
    }
}

@Component({
    selector: 'add-profile-dialog',
    templateUrl: './dialog/add-profile.dialog.html',
    styleUrls: ['./dialog/add-profile.dialog.scss']
})

export class AddProfileDialog {
    
    constructor(
        @Inject(MAT_DIALOG_DATA) public game: Games,
        public global: DashboardComponent
    ) {
    }
}