import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {

    constructor(public auth: AngularFireAuth) {
    }
    
    // this.auth.auth.onAuthStateChanged(user: string => {

    // })
}
