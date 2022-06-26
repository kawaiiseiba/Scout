import { Component, Inject, OnInit, ViewChild, OnDestroy } from '@angular/core';

import { Router, RouterEvent, NavigationEnd, NavigationStart } from '@angular/router';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {AbstractControl, Form, FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';

import { Observable, switchMap, of, Subscriber, Subscription } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { AccountService } from '../services/account.service';
import { GamesService } from '../services/games.service';
import { Games, User } from '../services/models/data.model';

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || isSubmitted));
    }
}

export interface SigninSignupData{
    emailFormControl: any,
    signupPassword: any,
    signinPassword: any,
    matcher: MyErrorStateMatcher,
    isPasswordRevealed: boolean
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})

export class LandingComponent implements OnInit, OnDestroy {

    gamesContainer: Games[]
    $gameSubscription: Subscription
    userRef: User | null | undefined
    $userSubscription: Subscription

    constructor(
        public router: Router,
        public dialog: MatDialog,
        public authService: AuthService,
        public gameRef: GamesService,
        public accService: AccountService,
    ) {
        this.$gameSubscription = this.gameRef.gameArchive().valueChanges().pipe(
            switchMap(game => {
                return of(game.map(i => i))
            })
        ).subscribe((data: any) => {
            this.gamesContainer = data
        })

        this.$userSubscription = this.authService.user$.subscribe(data => {
            this.userRef = data
        })
    }

    async ngOnInit() {
    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this.$gameSubscription.unsubscribe()
        this.$userSubscription.unsubscribe()
    }

    onLogout(){
        this.authService.logout()
        this.router.navigateByUrl('/')
    }
    

    events = [
        {
            name: 'Call of Duty: Modern Warfare',
            url: '../../assets/landing_bg/cod_bg.jpg',
            description: 'Call of Duty is a first-person shooter video game based on id Tech 3'
        },
        {
            name: 'Valorant',
            url: '../../assets/landing_bg/valorant_bg.jpg',
            description: 'A 5v5 character-based tactical FPS where precise gunplay meets unique agent abilities.'
        },
        {
            name: 'Mobile Legends: Bang Bang',
            url: '../../assets/landing_bg/ml_bg.jpg',
            description: 'Mobile Legends is a 5v5 MOBA for handheld devices that offers a variety of playable heroes, game modes, and intense, fast-paced gameplay.'
        },
        {
            name: 'Dota 2',
            url: '../../assets/landing_bg/dota_bg.jpg',
            description: 'Dota 2 is a multiplayer online battle arena (MOBA) video game in which two teams of five players compete to collectively destroy a large structure defended by the opposing team known as the "Ancient", whilst defending their own.'
        },
        {
            name: 'LoL: Wild Rift',
            url: '../../assets/landing_bg/wr_bg.jpg',
            description: 'League of Legends: Wild Rift is a multiplayer online battle arena (MOBA) game in the three-dimensional isometric perspective.'
        },
        {
            name: 'PlayerUnknown Battlegrounds (PUBG)',
            url: '../../assets/landing_bg/pubg_bg.jpg',
            description: 'PUBG is a player versus player shooter game in which up to one hundred players fight in a battle royale, a type of large-scale last man standing deathmatch where players fight to remain the last alive.'
        },
    ]

    openDialog(id: string) {
        this.dialog.open(NewsDialog);
    }

    openAuthDialog(){
        if(!this.userRef && this.userRef !== null) return console.log(`Clicked but you're already logged in.`)
        this.dialog.open(SigninSignupDialog, {
            width: '500px',
            // height: '60%',
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel'
        })
    }

  
}

@Component({
    selector: 'news-dialog',
    templateUrl: './dialog/news.dialog.html',
})

export class NewsDialog{
    // constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}

@Component({
    selector: 'signin-signup-dialog',
    templateUrl: './dialog/signin-signup.dialog.html',
})

export class SigninSignupDialog{
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: SigninSignupData,
        public authService: AuthService,
        public landingComponent: LandingComponent
    ) {}

    async onSignIn(email: string, password: string){
        try {
            await this.authService.signIn(email, password)
            this.landingComponent.dialog.closeAll()
        } catch (e) {
            console.log(e)
        }
    }

    async onSignUp(email: string, password: string){
        try {
            this.landingComponent.dialog.closeAll()
            await this.authService.signUp(email, password)
        } catch (e) {
            console.log(e)
        }
    }


    signupEmail = new FormControl('', [Validators.required, Validators.email]);
    signinEmail = new FormControl('', [Validators.required, Validators.email]);
    signupPassword = new FormControl('', [Validators.required, Validators.pattern(/^(?!.*\s)(?=.*\d)(?=.*[A-Z])(.{8}.*)$/i)]);
    signinPassword = new FormControl('', [Validators.required, Validators.pattern(/.{8}.*/i)]);

    isPasswordRevealed = false

    nonWhiteSpace = (val: string) => {
        return /^\S+$/g.test(val)
    }

    oneNumeric = (val: string) => {
        return /^.*\d.*$/g.test(val)
    }

    oneUppercase = (val: string) => {
        return /^.*[A-Z].*$/g.test(val)
    }

    atleastEight = (val: string) => {
        return /^.{8}.*$/g.test(val)
    }


    matcher = new MyErrorStateMatcher();

    
    isSignin = true
}

