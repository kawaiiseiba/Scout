import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { AccountService } from './account.service';
import { User } from './models/data.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    user$: Observable<User | null | undefined>

    constructor(
        private auth: AngularFireAuth,
        private accService: AccountService,
        private db: AngularFirestore
    ) { 
        this.user$ = this.auth.authState.pipe(
            switchMap(user => {
                if(user) return this.db.doc<User>('/users/'+user.uid).valueChanges()
                return of(null)
            })
        )
    }

    signIn = async (email: string, password: string) => await this.auth.signInWithEmailAndPassword(email, password)
    signUp = async (email: string, password: string) => {
        try{
            const credential = await this.auth.createUserWithEmailAndPassword(email, password)

            this.accService.createAccount({ uid: credential.user?.uid, email: credential.user?.email! })
        } catch(e) {
            return e
        }
    }
    
    logout = () => this.auth.signOut()
}
