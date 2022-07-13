import { Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Observable, of, switchMap, take } from 'rxjs';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { Chat, Events, Likes, Members, Organization, Position, Posts, Profile, User } from '../services/models/data.model';
import { OrganizationService } from '../services/organization.service';
import { PostsService } from '../services/posts.service';


@Component({
  selector: 'app-organization-content',
  templateUrl: './organization-content.component.html',
  styleUrls: ['./organization-content.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrganizationContentComponent implements OnInit {

    title = 'saddsa'

    organization: Organization

    orgPost$: Observable<Posts[]>

    events$: Observable<Events[]>

    chats$: Observable<Chat[]>

    member: Members
    members$: Observable<Members[]>

    positions: Position[]

    constructor(
        public global: DashboardComponent,
        private db: AngularFirestore,
        private route: ActivatedRoute,
        private router: Router,
        private postRef: PostsService,
        private org: OrganizationService,
        private chatRef: ChatService,
        private auth: AuthService,
        private dialog: MatDialog
    ) { 
        this.db.doc<Organization>('organizations/'+this.route.snapshot.params['organization_id']).valueChanges({ idField: 'oid' }).pipe(take(1)).subscribe(
            data => {
                this.organization = data!

                this.orgPost$ = this.db.collection<Posts>('posts', ref => ref.where('contentFrom', '==', data!.oid).orderBy('date', 'desc')).valueChanges()
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
                            return post
                        }))
                    })
                )
            }
        )

        this.auth.user$.subscribe(user => {
            this.db.collection<Members>('members', ref => ref.where('user', '==', user?.uid).limit(1)).valueChanges({ idField: 'id' }).subscribe(member => {
                if(member.length > 0) {
                    this.member = member[0]
                    this.db.doc<User>('users/'+user?.uid).valueChanges().subscribe(user => {
                        this.member.userRef = user
                    })
                }
            })
        })

        this.members$ = this.db.collection<Members>('members', ref => ref.where('organization', '==', this.route.snapshot.params['organization_id'])).valueChanges({ idField: 'id' })
        .pipe(
            switchMap(x => {
                return of(x.map(v => {

                    this.db.doc<User>('users/'+v.user).valueChanges().subscribe(data => {
                        v.userRef = data
                    })
                    return v
                }))
            })
        )

        this.db.collection<Position>('positions').valueChanges({ idField: 'id'})
        .subscribe(data => {
            this.positions = data
        })

        this.events$ = this.db.collection<Events>('events', ref => ref.where('org', '==', this.route.snapshot.params['organization_id']).orderBy('date', 'desc')).valueChanges()

        this.chats$ = this.db.collection<Chat>('chat', ref=> ref.where('reference', '==', this.route.snapshot.params['organization_id']).orderBy('date', 'desc')).valueChanges()
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

    orgRoutes = [
        '',
        'events',
        'chat',
        'members',
        'jobs'
    ]

    routeId: number = this.orgRoutes.indexOf(this.route.snapshot.firstChild?.routeConfig?.path!)

    @ViewChild('banner') bannerInput: ElementRef;
    bannerPath: Blob
    bannerPrev: string | ArrayBuffer | null
    bannerFileType: string

    addBannerFile($event: any){
        var fileTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']

        this.bannerPath = $event.target.files[0]
        this.bannerFileType = $event.target.files[0].name.split('.').pop().toLowerCase()

        if(fileTypes.indexOf(this.bannerFileType) < 0) return

        const reader = new FileReader();
        reader.onload = e => this.bannerPrev = reader.result;

        reader.readAsDataURL(this.bannerPath)
    }

    @ViewChild('icon') iconInput: ElementRef;
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

    
    @ViewChild('file') fileInput: ElementRef;
    filePath: Blob
    filePrev: string | ArrayBuffer | null

    isDisable = true
    isPosting = false
    description: string

    navigatePost(url: string) {
        this.router.navigate([url])
    }

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
            description: this.description,
            contentFrom: this.organization.oid
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

    event = new FormGroup({
        topic: new FormControl(''),
        start: new FormControl(null),
        description: new FormControl(''),
    })

    toRawDate(timestamp: number){
        return new Date(timestamp)
    }

    toDate(timestamp: number){
        return moment(new Date(timestamp)).format('h:mm A · MMM D, YYYY')
    }

    isCreateEventActive = false

    @ViewChild('cover') eventCover: ElementRef;
    coverPath: Blob
    coverPrev: string | ArrayBuffer | null
    coverFileType: string

    eventIdentity(index: number, post: Events) {
        return post.eid
    }

    @ViewChild('createEventBtn') createEventBtn: MatButton

    uploadCover($event: any) {
        var fileTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']

        this.coverPath = $event.target.files[0]

        this.coverFileType = $event.target.files[0].name.split('.').pop().toLowerCase()
        if(fileTypes.indexOf(this.coverFileType) < 0) return

        const reader = new FileReader();
        reader.onload = e => this.coverPrev = reader.result;

        reader.readAsDataURL(this.coverPath)
    }

    createEvent() {
        this.createEventBtn.disabled = true
        const content = {
            cover: this.coverPrev ? this.coverPath : undefined,
            coverType: this.coverPrev ? this.coverFileType : undefined,
            description: this.event.controls['description'].value,
            startDate: this.event.controls['start'].value,
            topic: this.event.controls['topic'].value,
            org: this.organization.oid
        }

        this.org.createEvent(content).then(data => {
            this.isCreateEventActive = false
            this.createEventBtn.disabled = false
            this.coverPrev = ''
            this.eventCover.nativeElement.value = ''
            this.event.reset()
        })
    }

    interested(id: string){
        this.postRef.likeUnlike(id)
    }

    setChatHeight(){
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

        return vh - 228.45
    }

    @ViewChild('chatAttachment') chatAttachment: ElementRef;
    chatAttachmentPath: Blob
    chatAttachmentPrev: string | ArrayBuffer | null
    chatAttachmentFileType: string

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
            reference: this.organization.oid
        }

        this.chatRef.send(content).then(() => {
            console.log('should be reset')
            this.sendBtn.disabled = false
            this.chat.reset()
            this.chatAttachmentPrev = ''
        })
    }

    joinOrg(org: Organization){
        this.org.joinOrganization(org).then(() => {
            window.location.href = org.gameRef+'/organization/'+org.oid
        })
    }

    leaveOrg(org: Organization){
        this.org.leaveOrganization(org, this.member).then(() => {
            window.location.href = org.gameRef+'/organization/list'
        })
    }

    openInviteDialog(org: Organization){
        this.dialog.open(InviteMembersDialog, {
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel',
            width: '600px',
            position: {
                top: '50px'
            },
            data: org
        })
    }

    ngOnInit(): void {
    }

}


@Component({
    selector: 'invite-members-dialog',
    templateUrl: './dialog/invite-members.dialog.html',
    encapsulation: ViewEncapsulation.None
})

export class InviteMembersDialog {

    users: Profile[]
    constructor(
        @Inject(MAT_DIALOG_DATA) public organization: Organization,
        public org: OrganizationService,
        private db: AngularFirestore,
        private auth: AuthService,
        private dialogRef: MatDialogRef<InviteMembersDialog>,
        private global: DashboardComponent
    ){
        this.global.user$.subscribe(data => {
            this.db.collection<Profile>('profiles', ref => ref.where('gameRef', '==', data?.selectedGame)).valueChanges()
            .pipe(
                switchMap(x => {
                    return of(x.filter(v => {
                        this.db.collection<Members>('members', ref => ref.where('user', '==', v.user)).valueChanges().pipe(take(1)).subscribe(data => {
                            v.isMember = data.length > 0
                        })
                        
                        this.db.doc<User>('users/'+v.user).valueChanges().subscribe(data => {
                            v.userRef = data
                        })

                        if(v.user === data?.uid) return

                        return v
                    }))
                })
            ).subscribe(data => {
                this.users = data
            })
        })
        
    }

    addMember(org: Organization, user: User){
        this.org.addMember(org, user)
    }
}