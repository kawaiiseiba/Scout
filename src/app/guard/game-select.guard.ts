import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable, of, Subscription, switchMap, take } from 'rxjs';
import { AccountService } from '../services/account.service';

import { AuthService } from '../services/auth.service';
import { GamesService } from '../services/games.service';
import { User } from '../services/models/data.model';

@Injectable({
  providedIn: 'root'
})
export class GameSelectGuard implements CanActivate, CanActivateChild, CanLoad {

    userRef: User | null | undefined
    $userSubscription: Subscription

    constructor(
        private route: Router,
        private auth: AuthService,
        private gameRef: GamesService,
        private accountRef: AccountService
    ) {
        
    }
    canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return new Promise(resolve => {
            if(!this.userRef?.selectedGame) resolve(false)
            resolve(true)
        })
    }
    canActivate(router: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return new Promise(async resolve => {
            const baseURL = router.params['game_url']
            const matchURL = await this.gameRef.findMatch(baseURL)
            if(baseURL !== 'game' && !matchURL) return this.route.navigate(['/'])
            this.auth.user$.pipe(take(1)).subscribe(data =>{
                if(data === null && data === undefined) return resolve(true)
                if(baseURL === 'game' && data?.selectedGame) return window.location.href = '/'+data.selectedGame
                if(baseURL !== 'game' && (baseURL != data?.selectedGame) && matchURL) this.accountRef.selectedGame({ uid: data?.uid, selectedGame: baseURL})
            })
            return resolve(true)
        })
    }
    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return new Promise(resolve => {
            if(!this.userRef?.selectedGame) resolve(false)
            resolve(true)
        })
    }
  
}
