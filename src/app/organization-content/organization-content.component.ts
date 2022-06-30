import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, switchMap, take } from 'rxjs';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { Likes, Organization, Posts, User } from '../services/models/data.model';
import { PostsService } from '../services/posts.service';

@Component({
  selector: 'app-organization-content',
  templateUrl: './organization-content.component.html',
  styleUrls: ['./organization-content.component.scss']
})
export class OrganizationContentComponent implements OnInit {

    title = 'saddsa'

    organization: Organization

    orgPost$: Observable<Posts[]>

    constructor(
        public global: DashboardComponent,
        private db: AngularFirestore,
        private route: ActivatedRoute,
        private router: Router,
        private postRef: PostsService
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

    ngOnInit(): void {
    }

}
