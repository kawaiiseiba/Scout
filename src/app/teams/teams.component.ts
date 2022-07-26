import { Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { Application, Chat, Profile, Teamates, Teams, User } from '../services/models/data.model';
import * as moment from 'moment';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TeamsService } from '../services/teams.service';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TeamsComponent implements OnInit {

    team: Teams

    chats$: Observable<Chat[]>

    user: User

    constructor(
        private db: AngularFirestore,
        private route: ActivatedRoute,
        private chatRef: ChatService,
        private auth: AuthService,
        private dialog: MatDialog,
        private teams: TeamsService
    ) {

        this.auth.user$.subscribe(data => {
            this.user = data!
        })

        this.db.collection<Teams>('teams').doc(this.route.snapshot.params['team']).valueChanges({ idField: 'id' })
        .subscribe(data => {
            this.team = data!
        })

        this.chats$ = this.db.collection<Chat>('chat', ref=> ref.where('reference', '==', this.route.snapshot.params['team']).orderBy('date', 'desc')).valueChanges()
        .pipe(
            switchMap(x => {
                return of(x.map(chat => {
                    this.db.doc<User>('users/'+chat.user).valueChanges().pipe(take(1)).subscribe(data => {
                        chat.userRef = data
                    })

                    return chat
                }))
            })
        )
     }

    ngOnInit(): void {
    }

    toRawDate(timestamp: number){
        return new Date(timestamp)
    }

    toDate(timestamp: number){
        return moment(new Date(timestamp)).format('h:mm A · MMM D, YYYY')
    }

    setChatHeight(){
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

        return vh - 73
    }

    @ViewChild('chatAttachment') chatAttachment: ElementRef;
    chatAttachmentPath: Blob
    chatAttachmentPrev: string | ArrayBuffer | null
    chatAttachmentFileType: string
    isPosting = false

    @ViewChild('send') sendBtn: MatButton

    uploadChatAttachment($event: any) {
        var fileTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']

        this.chatAttachmentPath = $event.target.files[0]

        this.chatAttachmentFileType = $event.target.files[0].name.split('.').pop().toLowerCase()
        if(fileTypes.indexOf(this.chatAttachmentFileType) < 0) return

        const reader = new FileReader();
        reader.onload = e => this.chatAttachmentPrev = reader.result;

        reader.readAsDataURL(this.chatAttachmentPath)
    }

    chat = new FormGroup({
        content: new FormControl('')
    })

    checkForWhiteSpace(str: string){
        return str.trim().length < 1
    }

    sendChat() {
        if(this.sendBtn.disabled === true) return
        this.sendBtn.disabled = true
        const content = {
            attachment: this.chatAttachmentPrev ? this.chatAttachmentPath : undefined,
            attachmentType: this.chatAttachmentPrev ? this.chatAttachmentFileType : undefined,
            content: this.chat.controls['content'].value,
            reference: this.team.id
        }

        this.chatRef.send(content).then(() => {
            console.log('should be reset')
            this.sendBtn.disabled = false
            this.chat.reset()
            this.chatAttachmentPrev = ''
        })
    }

    deleteChat(chat: Chat){
        this.chatRef.delete(chat)
    }

    openInviteDialog(){
        this.dialog.open(InviteMembersDialog, {
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel',
            width: '600px',
            position: {
                top: '50px'
            },
            data: this.team
        })
    }

    openRosterDialog(){
        this.dialog.open(RostersDialog, {
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel',
            width: '600px',
            position: {
                top: '50px'
            },
            data: this.team
        })
    }

    leaveTeam(){
        this.teams.leaveTeam(this.team, this.user).then(() => {
            window.location.href = this.team.game+'/scout'
        })
        
    }
    

    openTeamApplicants(){
        this.dialog.open(TeamApplicants, {
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel',
            width: '600px',
            data: this.team
        })
    }
}

@Component({
    selector: 'invite-members-dialog',
    templateUrl: './dialog/invite-members.dialog.html',
    encapsulation: ViewEncapsulation.None
})

export class InviteMembersDialog {

    users$: Observable<Profile[]>
    constructor(
        @Inject(MAT_DIALOG_DATA) public team: Teams,
        private dialogRef: MatDialogRef<InviteMembersDialog>,
        private auth: AuthService,
        private db: AngularFirestore,
        private teams: TeamsService
    ){
        this.auth.user$.subscribe(data => {
            this.users$ = this.db.collection<Profile>('profiles', ref => ref.where('gameRef', '==', data?.selectedGame)).valueChanges()
            .pipe(
                switchMap(x => {
                    return of(x.filter(v => {
                        this.db.collection<Teamates>('teamates', ref => ref.where('user', '==', v.user)).valueChanges().pipe(take(1)).subscribe(data => {
                            v.isMember = data.length > 0
                        })
                        
                        this.db.doc<User>('users/'+v.user).valueChanges().subscribe(data => {
                            v.userRef = data
                        })

                        if(v.user === data?.uid) return

                        return v
                    }))
                })
            )
        })
        
    }

    addTeamates(user: User){
        this.teams.addTeamate(this.team, user)
        this.dialogRef.close()
    }
}

@Component({
    selector: 'rosters-dialog',
    templateUrl: './dialog/rosters.dialog.html',
    encapsulation: ViewEncapsulation.None
})

export class RostersDialog {

    user: User
    users$: Observable<Profile[]>
    constructor(
        @Inject(MAT_DIALOG_DATA) public team: Teams,
        private dialogRef: MatDialogRef<RostersDialog>,
        private auth: AuthService,
        private db: AngularFirestore,
        private teams: TeamsService
    ){
        this.auth.user$.subscribe(data => {
            this.user = data!
            this.users$ = this.db.collection<Profile>('profiles', ref => ref.where('gameRef', '==', data?.selectedGame)).valueChanges()
            .pipe(
                switchMap(x => {
                    return of(x.filter(v => {

                        this.db.collection<Teamates>('teamates').doc(team?.id!+'_'+v.user).valueChanges().subscribe(data => {
                            if(data) v.hasTeam = true
                        })

                        this.db.doc<User>('users/'+v.user).valueChanges().subscribe(data => {
                            v.userRef = data
                        })

                        return v
                    }))
                })
            )
        })
        
    }

    kickTeamates(user: User){
        this.teams.leaveTeam(this.team, user)
        this.dialogRef.close()
    }
}


@Component({
    selector: 'team-applicants-dialog',
    templateUrl: './dialog/team-applicants.dialog.html',
    encapsulation: ViewEncapsulation.None
})

export class TeamApplicants {

    applications$: Observable<Application[]>
    constructor(
        @Inject(MAT_DIALOG_DATA) public team: Teams,
        private db: AngularFirestore,
        private auth: AuthService,
        private dialogRef: MatDialogRef<TeamApplicants>,
        private dialog: MatDialog,
        private teams: TeamsService
    ){
        this.applications$ = this.db.collection<Application>('applications', ref => ref.where('team', '==', team.id).orderBy('date', 'desc')).valueChanges({ idField: 'id' })
        .pipe(
            switchMap(x => {
                return of(x.map(data => {
                    this.db.doc<User>('users/'+data.user).valueChanges().subscribe(user => {
                        if(user) data.userRef = user
                    })
                    return data
                }))
            })
        )
    }

    toRawDate(timestamp: number){
        return new Date(timestamp)
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

    openViewDialog(application: Application){
        this.dialog.open(ViewApplicationDialog, {
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel',
            width: '600px',
            position: {
                top: '50px'
            },
            data: {
                application: application,
                team: this.team
            }
        })
    }
}

@Component({
    selector: 'view-application-dialog',
    templateUrl: './dialog/view-application.dialog.html',
    encapsulation: ViewEncapsulation.None
})

export class ViewApplicationDialog {

    profile: Profile
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { application: Application, team: Teams },
        public teams: TeamsService,
        private db: AngularFirestore,
        private auth: AuthService,
        private dialogRef: MatDialogRef<ViewApplicationDialog>,
        private global: DashboardComponent
    ){
        this.db.collection<Profile>('profiles').doc(data.team.game+'_'+data.application.user).valueChanges()
        .pipe(take(1))
        .subscribe(data => {
            this.profile = data!
        })
    }
    toRawDate(timestamp: number){
        return new Date(timestamp)
    }

    rejectApplication(application: Application){
        this.db.collection<Application>('applications').doc(application.id).delete().then(() => {
            this.dialogRef.close()
        })
    }

    acceptApplication(){
        this.teams.addTeamate(this.data.team, this.data.application.userRef!).then(() => {
            this.db.collection<Application>('applications').doc(this.data.application.id).delete()
            .then(() => {
                this.dialogRef.close()
            })
        })
    }
}