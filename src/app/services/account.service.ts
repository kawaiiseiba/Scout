import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Games, User } from './models/data.model';
import { generateUsername } from 'unique-username-generator';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

    constructor(
        private db: AngularFirestore,
        private storage: AngularFireStorage
    ) {
    }

    getAccountByUsername(username: string) {
        return this.db.collection<User>('users', ref => ref.where('username', "==", username).limit(1)).valueChanges()
    }

    async createAccount({ uid, email, banned = false, joined = Date.now()}: User) {
        try{
            const data = {
                uid, email, banned, joined,
                username: generateUsername(),
                defaultAvatar!: await this.storage.storage.ref(`users/default.png`).getDownloadURL().then(url => url)
            }
            
            this.db.doc<User>('users/' + uid).set(data)
        } catch(e) {
            return e
        }
    }
    
    async selectedGame({ uid, selectedGame }: User){
        try{
            const data = {
                selectedGame
            }
            this.db.doc<User>('users/' + uid).update(data)
        } catch(e) {
            return e
        }
    }
}
