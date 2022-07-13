import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { of, switchMap, take } from 'rxjs';
import { AuthService } from './auth.service';
import { Chat, User } from './models/data.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

    chat: AngularFirestoreCollection<Chat>
    message: AngularFirestoreDocument<Chat>

    user: User

    constructor(
        private db: AngularFirestore,
        private auth: AuthService,
        private storage: AngularFireStorage
    ) {
        this.chat = this.db.collection<Chat>('chat')

        this.auth.user$.pipe(
            take(1),
            switchMap(user => {
                if(user) return this.db.doc<User>('users/'+user.uid).valueChanges()
                return of(null)
            })
        ).subscribe(data => {
            this.user = data!
        })
    }

    async send(data: Chat){
        const hasAttachment = data.attachment ? await this.uploadAttachment(data.attachment, data.reference!, 'chat', data.attachmentType!) : data.attachment

        const chatId = this.db.createId()

        const message = <Chat>{
            cid: chatId,
            attachment: hasAttachment ? hasAttachment : '',
            content: data.content ? data.content : '',
            user: this.user.uid,
            reference: data.reference,
            date: Date.now()
        }

        this.chat.doc(chatId).set(message, { merge: true })
    }

    async delete(data: Chat){
        this.message = this.db.doc<Chat>('chat/'+data.cid)

        if(data.attachment !== null && data.attachment !== undefined && (typeof data.attachment === "string" && data.attachment !== "")) this.deleteAttachment(data.attachment)

        this.message.delete()
    }

    async uploadAttachment(attachment: Blob | string, id: string, type: string, fileType: string){
        const filePath = `chat/${id}-${type}-${Date.now()}.${fileType}`
        return (await this.storage.upload(filePath, attachment)).ref.getDownloadURL().then(url => {
            return url
        })
    }

    deleteAttachment(attachment: string){
        return this.storage.refFromURL(attachment).delete()
    }
}
