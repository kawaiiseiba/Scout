import { Component, ElementRef, Inject, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MatSelectionList } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, switchMap, take } from 'rxjs';
import { runInThisContext } from 'vm';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AuthService } from '../services/auth.service';
import { Application, Organization, Roles, User } from '../services/models/data.model';
import { OrganizationService } from '../services/organization.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrganizationComponent implements OnInit {
    title = 'Organization'

    organizationList$: Observable<Organization[]>
    roles$: Observable<Roles[]>

    user: User | undefined

    constructor(
        private route: Router,
        private activatedRoute: ActivatedRoute,
        public global: DashboardComponent,
        private org: OrganizationService,
        private db: AngularFirestore,
        private _formBuilder: FormBuilder,
        private dialog: MatDialog,
        private auth: AuthService
    ) { 
        this.auth.user$.subscribe(data => {
            this.user = data!

            this.organizationList$ = this.db.collection<Organization>('organizations', ref => ref.where('gameRef', '==', this.global._routeURL)).valueChanges({ idField: 'oid'})
            .pipe(
                switchMap(x => {
                    return of(x.map(v => {
                        this.db.doc<Application>('applications/'+v.oid+'_'+this.user?.uid).valueChanges().subscribe(form => {
                            if(form !== undefined) return v.isApplied = true
                            return 
                        })
                        return v
                    }))
                })
            )
        })

        

        this.roles$ = this.db.collection<Roles>('teamRoles', ref => ref.orderBy('level', 'asc')).valueChanges({idField: 'roleId'})

    }

    routeId: string = this.activatedRoute.snapshot.firstChild?.routeConfig?.path!

    selectedIndex: number = this.routeId === 'create' ? 1 : 0

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

    sns_links: Array<any> =  [
        {
            class: 'bi-twitter',
            color: '#1DA1F2',
            name: 'twitter',
            url: ''
        },
        {
            class: 'bi-facebook',
            color: '#4267B2',
            name: 'facebook',
            url: ''
        },
        {
            class: 'bi-discord',
            color: '#5865F2',
            name: 'discord',
            url: ''
        },
        {
            class: 'bi-youtube',
            color: '#FF0000',
            name: 'youtube',
            url: ''
        },
        {
            class: 'bi-reddit',
            color: '#FF5700',
            name: 'reddit',
            url: ''
        },
    ]

    checkValidUrl(url: string): Boolean{
        var URL_REGEXP = /^[A-Za-z][A-Za-z\d.+-]*:\/*(?:\w+(?::\w+)?@)?[^\s/]+(?::\d+)?(?:\/[\w#!:.?+=&%@\-/]*)?$/;
        return URL_REGEXP.test(url)
    }

    @ViewChild('role') selectionList: MatSelectionList
    // selectedRoleValue: JSON | undefined

    // roleVal(){
    //     this.selectedRoleValue = this.selectionList.selectedOptions.selected[0].value
    // }

    @ViewChild('orgOptions') orgOptions: MatSelectionList
    orgUrl: string
    orgName: string
    orgDesc: string

    isNameExist?: boolean
    isUrlExist?: boolean

    checkOrgName(name: string){
        if(name.length < 1) return
        this.db.collection<Organization>('organizations', ref => ref.where('name', '==', name).limit(1)).valueChanges().subscribe(data => {
            if(data.length < 1) return this.isNameExist = false
            return this.isNameExist = true
        })
    }

    checkOrgUrl(url: string){
        if(url.length < 1) return
        this.db.doc<Organization>(`organizations/${url}_${this.global.selectedGame.id}`).valueChanges().subscribe(data => {
            if(!data) return this.isUrlExist = false
            return this.isUrlExist = true
        })
    }

    lfTypes = <any>{
        'direct-join': false,
        'lf-player': false,
        'lf-team': false,
        'lf-coach': false,
        'lf-manager': false,
    }

    @ViewChild('create') createBtn: MatButton

    createOrg(){
        this.createBtn.disabled = true
        this.orgOptions.selectedOptions.selected.map(i => {
            this.lfTypes[i.value] = true
        })

        const data = {
            oid: this.orgUrl,
            banner: this.bannerPrev ? this.bannerPath : undefined,
            bannerType: this.bannerPrev ? this.bannerFileType : undefined,
            icon: this.iconPrev ? this.iconPath : undefined,
            iconType: this.iconPrev ? this.iconFiletype : undefined,
            name: this.orgName,
            description: this.orgDesc,
            snsLinks: this.sns_links.map(i => {
                return {
                    ...i,
                    url: this.checkValidUrl(i.url) ? i.url : ''
                }
            }),
            settings: this.lfTypes
        }
        
        // if(this.selectedRoleValue !== undefined) {
        //     data.settings['direct-join'] = true 
        //     data.settings['default-role'] = this.selectedRoleValue 
        // }

        this.org.createOrganization(data).then(orgId => {
            window.location.href = this.global._routeURL+'/organization/'+orgId
        }).catch(e => {
            this.createBtn.disabled = false
            console.log(e)
        })
    }

    joinOrg(org: Organization){
        this.org.joinOrganization(org).then(orgId => {
            window.location.href = org.gameRef+'/organization/'+org.oid
        })
    }

    openApplyDialog(org: Organization){
        this.dialog.open(ApplyUserDialog, {
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel',
            width: '600px',
            data: org
        })
    }

    ngOnInit(): void {
    }

}

@Component({
    selector: 'position-settings-dialog',
    templateUrl: './dialog/apply-user.dialog.html',
    styleUrls: ['./dialog/apply-user.dialog.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ApplyUserDialog {


    constructor(
        @Inject(MAT_DIALOG_DATA) public organization: Organization,
        public org: OrganizationService,
        private db: AngularFirestore,
        private auth: AuthService,
        private dialogRef: MatDialogRef<ApplyUserDialog>
    ){
    }

    bio: string

    @ViewChild('submit') submitBtn: MatButton

    submitForm(){
        this.submitBtn.disabled = true
        const appplication = <Application>{
            organization: this.organization.oid,
            bio: this.bio,
        }

        this.org.submitApplication(appplication).then(() => {
            this.dialogRef.close()
        })
    }
}