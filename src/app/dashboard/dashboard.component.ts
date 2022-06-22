import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterEvent, NavigationEnd, NavigationStart, ActivatedRoute } from '@angular/router';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { GamesService } from '../services/games.service';
import { Games, User } from '../services/models/data.model';
import { AuthService } from '../services/auth.service';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    subloader: boolean
    hasActivity = true

    // selectedGame = 'option3'
    selectedGameColor = '#72491 !important'

    games: Games[]
    gameList$: Observable<Games[]>
    _routeURL: string

    user: User | null | undefined
    $userSubscription: Subscription

    gameSelectDialog$: MatDialogRef<GameListDialog>
    $gameSelectSubscription: Subscription

    selectedGame: Games

    constructor(
        public router: Router,
        private activatedRoute: ActivatedRoute,
        private gameRef: GamesService,
        public dialog: MatDialog,
        private authRef: AuthService
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

        this.$userSubscription = this.authRef.user$.subscribe(user => {
            this.user = user
        })

        this.gameRef.findByURL(this._routeURL).then(data => data.map(docs => {
            this.selectedGame = docs.data()
        }))


        this.openGameSelectDialog()
        
    }

    selectGame(url: string | undefined){
        try {
            window.location.href = './'+url
        } catch (e) {
            console.log(e)
        }
    }

    openGameSelectDialog() {
        if(this._routeURL !== 'game') return
        this.gameSelectDialog$ = this.dialog.open(GameListDialog, {
            width: '550px',
            // height: '650px',
            backdropClass: 'dark-backdrop',
        })

        this.$gameSelectSubscription = this.gameSelectDialog$.afterClosed().subscribe(
            () => this.router.navigate(['/'])
        )
    }

    onLogout(){
        this.authRef.logout()
        this.router.navigateByUrl('/')
    }

    async ngOnInit() {
        const data: Games = {
            icon: await this.gameRef.iconURL("Pt6RVNlDRVxieRbxI102"),
            banner: await this.gameRef.bannerURL("Pt6RVNlDRVxieRbxI102"),
            baseURL: ''
            // bgColor: '#231F1C',
            // textColor: '#CC911C',
            // publisher: 'KRAFTON, PUBG Corporation',
            // name: 'PUBG: Battlegrounds',
            // description: 'PUBG is a player versus player shooter game in which up to one hundred players fight in a battle royale, a type of large-scale last man standing deathmatch where players fight to remain the last alive.'
        }

        // this.gameRef.addGame(data)
        // this.gameRef.updateGameData(data, "Pt6RVNlDRVxieRbxI102")

        // this.gameList$.forEach(console.log)
    }

    ngOnDestroy(): void {
        this.$userSubscription.unsubscribe()
        this.$gameSelectSubscription?.unsubscribe()
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

    constructor(
        private gameRef: GamesService,
        private authRef: AuthService
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

    selectGame(url: string | undefined){
        try {
            window.location.href = './'+url
        } catch (e) {
            console.log(e)
        }
    }
}