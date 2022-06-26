import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

import { AccountService } from './account.service';
import { AuthService } from './auth.service';
import { User, Games } from './models/data.model';
import { Observable, of, switchMap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GamesService {

    gameGroup: AngularFirestoreCollectionGroup<Games>
    gameList: AngularFirestoreCollection<Games>
    gameRef: AngularFirestoreDocument<Games>

    constructor(
        private auth: AngularFireAuth,
        private accService: AccountService,
        private db: AngularFirestore,
        private storageRef: AngularFireStorage
    ) {
        this.gameList = this.db.collection<Games>('games')
        
    }

    gameArchive(): AngularFirestoreCollection<Games>{
        return this.gameList
    }

    async findMatch(url: string) {
        return (await this.db.collection<Games>('games').ref.where('baseURL', '==', url).get()).docs.length > 0
    }

    findByURL(id: string) {
        return this.db.collection<Games>('games', ref => ref.where('baseURL', '==', id)).valueChanges()
    }

    findById(id: string) {
        return this.db.doc<Games>('games/'+id).valueChanges()
    }
    
    addGame(data: Games){
        this.gameList = this.db.collection<Games>('games')
        this.gameList.add(data)
    }

    async updateGameData(data: Games, id: string){
        this.gameRef = this.db.doc('games/'+id)
        this.gameRef.update(data)
    }

    async iconURL(id: string){
        return this.storageRef.storage.ref(`games/${id}/icon.png`).getDownloadURL().then(url => url)
    }

    async bannerURL(id: string){
        return this.storageRef.storage.ref(`games/${id}/banner.png`).getDownloadURL().then(url => url)

    }

}
