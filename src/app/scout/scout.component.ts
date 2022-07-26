import { Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatButton } from '@angular/material/button';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AuthService } from '../services/auth.service';
import { Application, Profile, Teamates, Teams, User } from '../services/models/data.model';
import { TeamsService } from '../services/teams.service';

@Component({
  selector: 'app-scout',
  templateUrl: './scout.component.html',
  styleUrls: ['./scout.component.scss']
})
export class ScoutComponent implements OnInit {

    players$: Observable<Profile[]>
    user: User
    team: Teams

    teams$: Observable<Teams[]>

    constructor(
        private route: ActivatedRoute,
        private db: AngularFirestore,
        public global: DashboardComponent,
        private auth: AuthService,
        private dialog: MatDialog,
        private teams: TeamsService
    ) {
        this.auth.user$.subscribe(user => {
            this.user = user!

            this.players$ = this.db.collection<Profile>('profiles', ref => ref.where('gameRef', '==', global._routeURL)).valueChanges({ idField: 'id' })
            .pipe(
                switchMap(x => {
                    return of(x.filter(profile => {
                        if(!profile) return
                        if(profile.user === this.user.uid) return
                        this.db.collection<User>('users').doc(profile.user).valueChanges().subscribe(user => {
                            profile.userRef = user
                        })

                        this.db.collection<Teamates>('teamates', ref => ref.where('game', '==', global._routeURL).limit(1)).valueChanges()
                        .subscribe(teamate => {
                            if(teamate.length > 1) profile.hasTeam = true
                        })

                        if(profile.hasTeam) return

                        return profile
                    }))
                })
            )

            this.db.collection<Teamates>('teamates', ref => ref.where('user', '==', this.user.uid).limit(1)).valueChanges({ idField: 'id' })
            .subscribe(teammates => {
                if(teammates.length > 0){
                    this.db.collection<Teams>('teams').doc(teammates[0].team).valueChanges({ idField: 'id' })
                    .subscribe(team => {
                        this.team = team!
                    })
                }
                
            })

            this.teams$ =this.db.collection<Teams>('teams', ref => ref.where('game', '==', global._routeURL)).valueChanges({ idField: 'id' })
            .pipe(
                switchMap(x => {
                    return of(x.map(v => {
                        this.db.doc<Application>('applications/'+v.id+'_'+this.user?.uid).valueChanges().subscribe(form => {
                            if(form !== undefined) return v.isApplied = true
                            return 
                        })

                        return v
                    }))
                })
            )
        })

        
    }

    orgRoutes = [
        '',
        'lft',
        'lfg'
    ]

    routeId: number = this.orgRoutes.indexOf(this.route.snapshot.firstChild?.routeConfig?.path!)

    openCreateTeamDialog(){
        this.dialog.open(CreateTeamDialog, {
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel',
            width: '600px',
            position: {
                top: '50px'
            },
            data: this.global._routeURL
        })
    }

    addTeamates(user: User){
        this.teams.addTeamate(this.team, user)
    }

    openApplyDialog(team: Teams){
        this.dialog.open(ApplyTeamDialog, {
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel',
            width: '600px',
            data: team
        })
    }

    ngOnInit(): void {
    }

}

@Component({
    selector: 'create-team-dialog',
    templateUrl: './dialog/create-team.dialog.html',
    encapsulation: ViewEncapsulation.None
})

export class CreateTeamDialog {

    user: User
    constructor(
        @Inject(MAT_DIALOG_DATA) public game: string,
        private db: AngularFirestore,
        private auth: AuthService,
        private dialogRef: MatDialogRef<CreateTeamDialog>,
        private teams: TeamsService
    ) { 
        this.auth.user$.subscribe(data => {
            this.user = data!
        })
    }

    @ViewChild('icon') iconInput: ElementRef;
    @ViewChild('create') createBtn: MatButton;
    iconPath: Blob
    iconPrev: string | ArrayBuffer | null
    iconFiletype: string

    addIconFile($event: any){
        var fileTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']

        this.iconPath = $event.target.files[0]
        this.iconFiletype = $event.target.files[0].name.split('.').pop().toLowerCase()

        if(fileTypes.indexOf(this.iconFiletype) < 0) return

        const reader = new FileReader();
        reader.onload = e => this.iconPrev = reader.result;

        reader.readAsDataURL(this.iconPath)
    }

    teamName: string
    teamDescription: string
    isNameExist?: boolean

    checkTeamName(name: string){
        if(name.length < 1) return
        this.db.collection<Teams>('teams', ref => ref.where('name', '==', name).limit(1)).valueChanges().subscribe(data => {
            if(data.length < 1) return this.isNameExist = false
            return this.isNameExist = true
        })
    }

    createTeam(){
        this.createBtn.disabled = true
        const data = <Teams>{
            createdAt: Date.now(),
            description: this.teamDescription,
            name: this.teamName,
            game: this.game,
            icon: this.iconPrev ? this.iconPath : undefined,
            iconType: this.iconPrev ? this.iconFiletype : undefined,
            owner: this.user.uid,
            count: 1
        }

        this.teams.createTeam(data).then(() => {
            this.dialogRef.close()
        })
    }
}

@Component({
    selector: 'apply-team-dialog',
    templateUrl: './dialog/apply-team.dialog.html',
    encapsulation: ViewEncapsulation.None
})

export class ApplyTeamDialog {


    constructor(
        @Inject(MAT_DIALOG_DATA) public team: Teams,
        private db: AngularFirestore,
        private auth: AuthService,
        private dialogRef: MatDialogRef<ApplyTeamDialog>,
        private teams: TeamsService
    ){
    }

    bio: string

    @ViewChild('submit') submitBtn: MatButton

    submitForm(){
        this.submitBtn.disabled = true
        const appplication = <Application>{
            team: this.team.id,
            bio: this.bio,
        }

        this.teams.submitApplication(appplication).then(() => {
            this.dialogRef.close()
        })
    }
}