import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

import { Observable, of, switchMap } from 'rxjs';
import { Posts, User } from './models/data.model';

@Injectable()
export class PostsService {

  user: User | null | undefined

  posts: AngularFirestoreCollection<Posts>

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private storage: AngularFireStorage
  ) { 
    this.auth.user$.subscribe(user => {
      this.user = user
    })

    this.posts = this.db.collection<Posts>('posts')
  }

  async createPost({ attachment, description, date = new Date, user! = user.uid, commentsCount: 0, likesCount: 0, sharesCount: 0 }: Posts){
    if(user == null && user == undefined) return

    if(attachment) {
      const filePath = 'posts/'+user+'_'+date.time()
      const fileRef = this.storage.ref(filePath)
      this.storage.upload(filePath, attachment)

      fileRef.getDownloadURL().then(url => {
        tattachment = url
      })
    }

    consts data = {
      attachment, description, date, user, commentsCount, likesCount, sharesCount
    }

  }

}