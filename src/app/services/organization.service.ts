import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { of, switchMap, take } from 'rxjs';
import { GamesService } from './games.service';
import { Application, Events, Games, Members, Organization, Position, Roles, User } from './models/data.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

    user: User | null | undefined
    game: Games

    organizations: AngularFirestoreCollection<Organization>
    events: AngularFirestoreCollection<Events>
    eventRef: AngularFirestoreDocument<Events>

    members: AngularFirestoreCollection<Members>

    constructor(
        private db: AngularFirestore,
        private auth: AngularFireAuth,
        private storage: AngularFireStorage,
        private gameRef: GamesService
    ) { 
        auth.authState.pipe(
            take(1),
            switchMap(user => {
                if(user) return this.db.doc<User>('users/'+user.uid).valueChanges()
                return of(null)
            })
        ).subscribe(data => {
            this.user = data

            this.gameRef.findByURL(data?.selectedGame!).pipe(
                take(1),
                switchMap(x => {
                    return of(x.map(game => game)[0])
                })
            ).subscribe(game => {
                this.game = game
            })
        })

        this.organizations = this.db.collection<Organization>('organizations')
        this.members = this.db.collection<Members>('members')
        this.events = this.db.collection<Events>('events')
    }

    async isOrgNameExist(name: string){
        return (await this.db.collection<Organization>('organizations').ref.where('name', '==', name).get()).docs.length > 0
    }

    async oneUserOneOrg(){
        return (await this.db.collection<Organization>('organizations').ref.where('owner', '==', this.user?.uid).get()).docs.length > 0
    }

    async createEvent(data: any){
        const hasCover = data.cover ? await this.uploadEventCover(data.cover, data.org, 'cover', data.coverType) : data.cover

        const eventId = this.db.createId()

        const events = <Events> {
            eid: eventId,
            cover: hasCover ? hasCover : '',
            description: data.description ? data.description : '',
            topic: data.topic,
            org: data.org,
            host: this.user?.uid,
            interestedCount: 0,
            status: 1,
            startDate: new Date(data.startDate).getTime(),
            date: Date.now()
        }

        this.db.collection('events').doc<Events>(eventId).set(events, { merge: true })
    }

    async uploadEventCover(attachment: Blob, id: string, type: string, fileType: string){
        const filePath = `events/${id}_${type}_${Date.now()}.${fileType}`
        return (await this.storage.upload(filePath, attachment)).ref.getDownloadURL().then(url => {
            return url
        })
    }

    async eventStatusChange(event: Events, state: number | undefined){
        this.eventRef = this.db.doc<Events>(event.eid!)
        const data = <Events>{
            status: state !== undefined ? state : event.startDate! <= Date.now() ? 2 : event.status
        }
        this.eventRef.set(data, { merge: true })
    }

    async cancelEvent(event: Events){
        this.eventRef = this.db.doc<Events>('events/'+event.eid!)

        if(event.cover !== null && event.cover !== undefined && (typeof event.cover === "string" && event.cover !== "")) this.deleteAttachment(event.cover)

        this.eventRef.delete()
    }

    autoRoles: Roles[] = [
        {
            name: "Manager",
            order: 0,
            permission: {
                canChat: true,
                canCreateEvent: true,
                canCreatePost: true,
            }
        },
        {
            name: "Coach",
            order: 1,
            permission: {
                canChat: true,
                canCreateEvent: false,
                canCreatePost: true,
            }
        },
        {
            name: "Player",
            order: 2,
            permission: {
                canChat: true,
                canCreateEvent: false,
                canCreatePost: true,
            }
        },
    ]

    async createOrganization(data: any){
        if(await this.oneUserOneOrg()) return console.log('you can only create 1 org per account')
        if(await this.isOrgNameExist(data.name)) return console.log('org with name'+data.name+'exists')

        const orgId = data.oid

        const hasBanner = data.banner ? await this.uploadAttachment(data.banner, orgId, 'banner', data.bannerType) : data.banner
        const hasIcon = data.icon ? await this.uploadAttachment(data.icon, orgId, 'icon', data.iconType) : data.icon

        const organization = <Organization> {
            banner: hasBanner ? hasBanner : '',
            description: data.description ? data.description : '',
            gameRef: this.game.baseURL,
            icon: hasIcon ? hasIcon : '',
            memberCount: 1,
            name: data.name,
            owner: this.user?.uid,
            postCount: 0,
            teamCount: 0,
            snsLink: data.snsLinks,
            settings: data.settings,
            date: Date.now()
        }

        for(let role of this.autoRoles){
            role.organization = orgId
            this.db.collection<Roles>('roles').add(role)
        }

        const member = <Members>{
            banned: false,
            organization: orgId,
            position: 'admin',
            user: this.user?.uid,
            date: Date.now()
        }

        this.members.add(member)
        return this.organizations.doc<Organization>(orgId).set(organization, { merge: true }).then(() => {
            return orgId
        })
    }

    async editOrganization(data: Organization) {
        const orgId = data.oid

        const hasBanner = data.banner instanceof Blob ? await this.uploadAttachment(data.banner, orgId!, 'banner', data.bannerType!) : data.banner
        const hasIcon = data.icon instanceof Blob ? await this.uploadAttachment(data.icon, orgId!, 'icon', data.iconType!) : data.icon

        const organization = <Organization> {
            banner: hasBanner ? hasBanner : '',
            description: data.description ? data.description : '',
            gameRef: this.game.baseURL,
            icon: hasIcon ? hasIcon : '',
            memberCount: 1,
            name: data.name,
            owner: this.user?.uid,
            postCount: 0,
            teamCount: 0,
            snsLink: data.snsLink,
            settings: data.settings,
            date: Date.now()
        }

        return this.organizations.doc<Organization>(orgId).set(organization, { merge: true }).then(() => {
            return orgId
        })
    }

    async addMember(org: Organization, user: User){
        const member = <Members>{
            banned: false,
            organization: org.oid,
            position: 'member',
            user: user?.uid,
            date: Date.now()
        }

        org.memberCount = org.memberCount! + 1

        this.members.add(member)
        return this.organizations.doc<Organization>(org.oid).set(org, { merge: true }).then(() => {
            return org.oid
        })
    }

    async leaveOrganization(org: Organization, member: Members){
        org.memberCount = org.memberCount! - 1

        this.db.doc<Members>('members/'+member.id).delete()
        return this.organizations.doc<Organization>(org.oid).set(org, { merge: true }).then(() => {
            return org.oid
        })
    }

    async joinOrganization(org: Organization){
        const member = <Members>{
            banned: false,
            organization: org.oid,
            position: 'member',
            user: this.user?.uid,
            date: Date.now()
        }

        org.memberCount = org.memberCount! + 1

        this.members.add(member)
        return this.organizations.doc<Organization>(org.oid).set(org, { merge: true }).then(() => {
            return org
        })
    }

    submitApplication(application: Application){
        const id = application.organization+'_'+this.user?.uid
        application.user = this.user?.uid
        application.date = Date.now()

        return this.db.doc<Application>('applications/'+id).set(application, { merge: true })
    }

    editPosition(position: Position){
        return this.db.collection<Position>('positions').doc<Position>(position.id).set(position, { merge: true })
    }

    editRole(role: Roles){
        return this.db.collection<Roles>('roles').doc<Position>(role.id).set(role, { merge: true })
    }

    addRole(role: Roles){
        return this.db.collection<Roles>('roles').add(role)
    }

    deleteRole(role: Roles){
        return this.db.doc<Roles>('roles/'+role.id).delete()
    }

    updateRoleOrder(roles: Roles[]){
        for(let role of roles){
            this.db.doc<Roles>('roles/'+role.id).set(role, { merge: true })
        }
    }

    async uploadAttachment(attachment: Blob, id: string, type: string, fileType: string){
        const filePath = `organizations/${id}/${type}.${fileType}`
        return (await this.storage.upload(filePath, attachment)).ref.getDownloadURL().then(url => {
            return url
        })
    }

    deleteAttachment(attachment: string){
        return this.storage.refFromURL(attachment).delete()
    }

}
