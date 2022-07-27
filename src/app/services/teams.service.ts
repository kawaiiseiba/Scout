import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AuthService } from './auth.service';
import { Application, Profile, Teamates, Teams, User } from './models/data.model';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {

    user: User
    constructor(
        private auth: AuthService,
        private db: AngularFirestore,
        private storage: AngularFireStorage
    ) { 
        this.auth.user$.subscribe(data => {
            this.user = data!
        })
    }

    async createTeam(team: Teams){

        const teamId = this.db.createId()

        const hasIcon = team.icon instanceof Blob ? await this.uploadAttachment(team.icon, teamId, 'icon', team.iconType!) : team.icon
        team.description = team.description ? team.description : ''

        team.icon = hasIcon ? hasIcon : ''

        const teamate = <Teamates> {
            date: Date.now(),
            team: teamId,
            user: this.user.uid,
            game: team.game
        }

        const profile = <Profile>{
            hasTeam: true
        }
        
        this.db.collection<Profile>('profiles').doc(team.game+'_'+this.user.uid).set(profile, { merge: true })

        return this.db.collection<Teams>('teams').doc(teamId).set(team, { merge: true }).then(() => {
            return this.db.collection<Teamates>('teamates').doc(teamId+'_'+this.user.uid).set(teamate, { merge: true})
        })
        
    }

    async addTeamate(team: Teams, user: User){
        if(team.count! >= 5) return
        const data = <Teams>{
            count: team.count! + 1
        }
        const teamate = {
            date: Date.now(),
            team: team.id,
            user: user.uid,
            game: team.game
        }

        const profile = <Profile>{
            hasTeam: true
        }

        this.db.collection<Profile>('profiles').doc(team.game+'_'+user.uid).set(profile, { merge: true })

        return this.db.collection<Teams>('teams').doc(team.id).set(data, { merge: true}).then(() => {
            return this.db.collection<Teamates>('teamates').doc(team.id+'_'+user.uid).set(teamate, { merge: true})
        })
    }

    async leaveTeam(team: Teams, user: User){
        const data = <Teams>{
            count: team.count! - 1
        }

        const profile = <Profile>{
            hasTeam: false
        }
        
        this.db.collection<Profile>('profiles').doc(team.game+'_'+user.uid).set(profile, { merge: true })

        return this.db.collection<Teams>('teams').doc(team.id).set(data, { merge: true}).then(() => {
            
            return this.db.collection<Teamates>('teamates').doc(team.id+'_'+user.uid).delete()
        })
    }

    submitApplication(application: Application){
        const id = application.team+'_'+this.user?.uid
        application.user = this.user?.uid
        application.date = Date.now()

        return this.db.doc<Application>('applications/'+id).set(application, { merge: true })
    }

    async uploadAttachment(attachment: Blob, id: string, type: string, fileType: string){
        const filePath = `teams/${id}/${type}.${fileType}`
        return (await this.storage.upload(filePath, attachment)).ref.getDownloadURL().then(url => {
            return url
        })
    }

    deleteAttachment(attachment: string){
        return this.storage.refFromURL(attachment).delete()
    }
}
