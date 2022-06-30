import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { of, switchMap, take } from 'rxjs';
import { GamesService } from './games.service';
import { Games, Organization, User } from './models/data.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

    user: User | null | undefined
    game: Games

    organizations: AngularFirestoreCollection<Organization>

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
    }

    async isOrgNameExist(name: string){
        return (await this.db.collection<Organization>('organizations').ref.where('name', '==', name).get()).docs.length > 0
    }

    async oneUserOneOrg(){
        return (await this.db.collection<Organization>('organizations').ref.where('owner', '==', this.user?.uid).get()).docs.length > 0
    }

    async createOrganization(data: any){
        if(await this.oneUserOneOrg()) return console.log('you can only create 1 org per account')
        if(await this.isOrgNameExist(data.name)) return console.log('org with name'+data.name+'exists')

        const orgId = this.game.id+'_'+this.user?.uid

        const hasBanner = data.banner ? await this.uploadAttachment(data.banner, orgId, 'banner', data.bannerType) : data.banner
        const hasIcon = data.icon ? await this.uploadAttachment(data.icon, orgId, 'icon', data.iconType) : data.icon

        const organization = <Organization> {
            banner: hasBanner ? hasBanner : '',
            description: data.description ? data.description : '',
            gameRef: this.game.id,
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

        return this.organizations.doc<Organization>(orgId).set(organization, { merge: true }).then(() => {
            return orgId
        })
    }

    async uploadAttachment(attachment: Blob, id: string, type: string, fileType: string){
        const filePath = `organizations/${id}/${type}.${fileType}`
        return (await this.storage.upload(filePath, attachment)).ref.getDownloadURL().then(url => {
            return url
        })
    }
}
