import { Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatButton } from '@angular/material/button';
import { MatSelectionList } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, take } from 'rxjs';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { Members, Organization, Position, Roles, User } from '../services/models/data.model';
import { OrganizationService } from '../services/organization.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-organization-settings',
  templateUrl: './organization-settings.component.html',
  styleUrls: ['./organization-settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrganizationSettingsComponent implements OnInit {

    organization: Organization
    
    previousUrl: string | undefined

    positions: Position[]

    roles: Roles[]

    constructor(
        public global: DashboardComponent,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private db: AngularFirestore,
        private org: OrganizationService,
        private dialog: MatDialog
    ) { 
        this.previousUrl = this.router.getCurrentNavigation()?.previousNavigation?.finalUrl?.toString()

        this.db.doc<Organization>('organizations/'+this.activatedRoute.snapshot.params['organization_id']).valueChanges({ idField: 'oid'})
        .pipe(take(1))
        .subscribe(data => {
            this.organization = data!
        })

        this.db.collection<Position>('positions').valueChanges({ idField: 'id'})
        .subscribe(data => {
            this.positions = data
        })

        this.db.collection<Roles>('roles', ref => ref.where('organization', '==', this.activatedRoute.snapshot.params['organization_id']).orderBy('order', 'asc')).valueChanges({ idField: 'id' })
        .subscribe(data => {
            this.roles = data
        })
    }

    settings = [
        '',
        'positions',
        'roles'
    ]

    routeId: number = this.settings.indexOf(this.activatedRoute.snapshot.firstChild?.routeConfig?.path!)

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

    findSns(name: string, arr: Array<any>){
        return arr.find(data => data.name === name)
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

    @ViewChild('orgSettings') orgSettings: MatSelectionList
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
        console.log(`${url}_${this.global.selectedGame.id}`)
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

    editOrg(){
        this.createBtn.disabled = true
        this.orgSettings.selectedOptions.selected.map(i => {
            this.lfTypes[i.value] = true
        })

        const data = {
            oid: this.orgUrl,
            banner: this.bannerPrev ? this.bannerPath : this.organization.banner,
            bannerType: this.bannerPrev ? this.bannerFileType : undefined,
            icon: this.iconPrev ? this.iconPath : this.organization.icon,
            iconType: this.iconPrev ? this.iconFiletype : undefined,
            name: this.organization.name,
            description: this.orgDesc,
            snsLinks: this.sns_links.filter(i => this.checkValidUrl(i.url)),
            settings: this.lfTypes
        }

        if(this.bannerPrev){
            this.organization.banner = this.bannerPath
            this.organization.bannerType = this.bannerFileType
        }

        if(this.iconPrev){
            this.organization.icon = this.iconPath
            this.organization.iconType = this.iconFiletype
        }

        this.organization.settings = this.lfTypes


        this.org.editOrganization(this.organization).then(() => {
            this.createBtn.disabled = false
        }).catch(e => {
            this.createBtn.disabled = false
            console.log(e)
        })
    }

    prevLocation() {
        if(this.previousUrl === undefined || this.previousUrl === this.router.url) return this.router.navigate(['/'+this.global._routeURL+'/home'])
        return this.router.navigate([this.previousUrl])
    }

    openPositionDialog(position: Position){
        this.dialog.open(PositionSettingsDialog, {
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel',
            width: '600px',
            data: position
        })
    }

    openRoleDialog(role: Roles){
        this.dialog.open(RoleSettingsDialog, {
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel',
            width: '600px',
            data: role
        })
    }

    openCreateRole(length: number){
        this.dialog.open(AddRoleDialog, {
            backdropClass: 'dark-backdrop',
            panelClass: 'dark-panel',
            width: '600px',
            data: length
        })
    }

    drop(event: CdkDragDrop<Roles[]>) {
        moveItemInArray(this.roles, event.previousIndex, event.currentIndex)
        this.roles.map((v, i) => {
            v.order = i
            return v
        })

        this.org.updateRoleOrder(this.roles)
    }

    ngOnInit(): void {
    }

}

@Component({
    selector: 'position-settings-dialog',
    templateUrl: './dialog/position-settings.dialog.html',
    styleUrls: ['./dialog/position-settings.dialog.scss'],
    encapsulation: ViewEncapsulation.None
})

export class PositionSettingsDialog {

    member: Members

    constructor(
        @Inject(MAT_DIALOG_DATA) public position: Position,
        public org: OrganizationService,
        private db: AngularFirestore,
        private auth: AuthService,
        private dialogRef: MatDialogRef<PositionSettingsDialog>
    ){
        this.auth.user$.subscribe(user => {
            this.db.collection<Members>('members', ref => ref.where('user', '==', user?.uid).limit(1)).valueChanges().subscribe(member => {
                if(member.length > 0) {
                    this.member = member[0]
                    this.db.doc<User>('users/'+user?.uid).valueChanges().subscribe(user => {
                        this.member.userRef = user
                    })
                }
            })
        })
    }

    savePosition(position: Position){
        this.org.editPosition(position).then(() => {
            this.dialogRef.close()
        })
    }
}

@Component({
    selector: 'role-settings-dialog',
    templateUrl: './dialog/role-settings.dialog.html',
    styleUrls: ['./dialog/role-settings.dialog.scss'],
    encapsulation: ViewEncapsulation.None
})

export class RoleSettingsDialog {

    member: Members

    constructor(
        @Inject(MAT_DIALOG_DATA) public role: Roles,
        public org: OrganizationService,
        private db: AngularFirestore,
        private auth: AuthService,
        private dialogRef: MatDialogRef<RoleSettingsDialog>
    ){
        this.auth.user$.subscribe(user => {
            this.db.collection<Members>('members', ref => ref.where('user', '==', user?.uid).limit(1)).valueChanges().subscribe(member => {
                if(member.length > 0) {
                    this.member = member[0]
                    this.db.doc<User>('users/'+user?.uid).valueChanges().subscribe(user => {
                        this.member.userRef = user
                    })
                }
            })
        })
    }

    deleteRole(role: Roles){
        this.org.deleteRole(role).then(() => {
            this.dialogRef.close()
        })
    }

    saveRole(role: Roles){
        if(role.name!.length < 2 ) return
        this.org.editRole(role).then(() => {
            this.dialogRef.close()
        })
    }
}

@Component({
    selector: 'role-settings-dialog',
    templateUrl: './dialog/add-role.dialog.html',
    encapsulation: ViewEncapsulation.None
})

export class AddRoleDialog {

    member: Members

    role: Roles

    constructor(
        @Inject(MAT_DIALOG_DATA) public length: number,
        public org: OrganizationService,
        private db: AngularFirestore,
        private auth: AuthService,
        private dialogRef: MatDialogRef<AddRoleDialog>
    ){
        this.auth.user$.subscribe(user => {
            this.db.collection<Members>('members', ref => ref.where('user', '==', user?.uid).limit(1)).valueChanges().subscribe(member => {
                if(member.length > 0) {
                    this.member = member[0]
                    this.db.doc<User>('users/'+user?.uid).valueChanges().subscribe(user => {
                        this.member.userRef = user
                    })
                }
            })
        })
        

        this.role = {
            name: "",
            order: length,
            permission: {
                canChat: false,
                canCreateEvent: false,
                canCreatePost: false,
            }
        }
    }

    addRole(role: Roles){
        if(role.name!.length < 2 ) return

        role.organization = this.member.organization

        this.org.addRole(role).then(() => {
            this.dialogRef.close()
        })
    }
}