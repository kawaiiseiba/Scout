import { Injectable } from '@angular/core';

import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

import { Observable, of, switchMap, take } from 'rxjs';
import { Likes, Comments, Posts, User } from './models/data.model';
import { AuthService } from './auth.service';
import { ActivatedRoute } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class PostsService {

    user: User | null | undefined

    post: Posts | undefined
    posts: AngularFirestoreCollection<Posts>
    postsRef: AngularFirestoreDocument<Posts>

    comment: Comments | undefined
    comments: AngularFirestoreCollection<Comments>
    commentRef: AngularFirestoreDocument<Comments>

    likes: AngularFirestoreCollection<Likes>
    likeRef: AngularFirestoreDocument<Likes>

    constructor(
        private auth: AuthService,
        private db: AngularFirestore,
        private storage: AngularFireStorage
    ) { 
        this.auth.user$.subscribe(user => {
            this.user = user
        })

        this.posts = this.db.collection<Posts>('posts')
        this.likes = this.db.collection<Likes>('likes')
        this.comments = this.db.collection<Comments>('comments')
    }

    async getAllPostFromGame(){
        return this.posts.snapshotChanges()
    }

    async createPost(content: Posts){
        try {
            if(this.user == null && this.user == undefined) return

            const attachment = content.attachment !== null && content.attachment !== undefined && content.attachment instanceof Blob 
                ? await this.uploadAttachment(content.attachment, 'posts') 
                : content.attachment
            const postId = this.db.createId()
            const data = <Posts>{
                pid: postId,
                attachment: attachment ? attachment : '', 
                description: content.description ? content.description : '', 
                date: Date.now(),
                contentFrom: content.contentFrom,
                user: this.user.uid,
                commentsCount: 0, 
                likesCount: 0, 
                sharesCount: 0
            }

            return this.posts.doc(postId).set(data)
        } catch (e) {
            return e
        }
    }

    async createComment(content: Comments){
        try {
            if(this.user == null && this.user == undefined) return

            const attachment = content.attachment !== null && content.attachment !== undefined && content.attachment instanceof Blob 
                ? await this.uploadAttachment(content.attachment, 'comments') 
                : content.attachment
            const commentId = this.db.createId()
            const data = <Comments>{
                cid: commentId,
                attachment: attachment ? attachment : '', 
                description: content.description ? content.description : '', 
                date: Date.now(),
                contentFrom: this.user.selectedGame,
                user: this.user.uid,
                reference: content.reference,
                referenceType: content.referenceType,
                commentsCount: 0, 
                likesCount: 0
            }

            this.postsRef = this.posts.doc<Posts>(content.reference)

            this.postsRef.valueChanges().pipe(
                take(1),
                switchMap(x => {
                    return of(x)
                })
            ).subscribe(comment => {
                this.commentRef = this.comments.doc<Comments>(commentId)
    
                this.postsRef.ref.get().then(doc => {
                    
                    const data = <Comments> {
                        commentsCount: comment?.commentsCount! + 1
                    }
    
                    this.postsRef.set(data, { merge: true })
                })
                
            })

            return this.comments.doc(commentId).set(data)
        } catch (e) {
            return e
        }
    }

    async uploadAttachment(attachment: Blob, path: string){
        const filePath = path+'/'+this.user?.uid+'_'+Date.now()+'.png'
        return (await this.storage.upload(filePath, attachment)).ref.getDownloadURL().then(url => {
            return url
        })
    }

    deleteAttachment(attachment: string){
        return this.storage.refFromURL(attachment).delete()
    }

    async deletePost(post: Posts){
        this.postsRef = this.posts.doc<Posts>(post.pid)

        if(post.attachment !== null && post.attachment !== undefined && (typeof post.attachment === "string" && post.attachment !== "")) this.deleteAttachment(post.attachment)

        this.postsRef.delete()
    }

    async likeUnlike(id: string){
        this.postsRef = this.posts.doc<Posts>(id)
        

        this.postsRef.valueChanges().pipe(
            take(1),
            switchMap(x => {
                return of(x)
            })
        ).subscribe(post => {
            const likeId = post?.pid+'_'+this.user?.uid
            this.likeRef = this.likes.doc<Likes>(likeId)

            this.likeRef.ref.get().then(doc => {
                
                const data = <Posts> {
                    likesCount: doc.exists ? post?.likesCount!- 1 : post?.likesCount! + 1
                }

                this.postsRef.set(data, { merge: true })
                !doc.exists ? this.likeRef.set({ user: this.user?.uid }) : this.likeRef.delete()
            })
            
        })
    }

    async likeUnlikeComment(pid: string, cid: string){
        this.commentRef = this.comments.doc<Comments>(cid)
        

        this.commentRef.valueChanges().pipe(
            take(1),
            switchMap(x => {
                return of(x)
            })
        ).subscribe(post => {
            const likeId = pid+'_'+post?.cid
            this.likeRef = this.likes.doc<Likes>(likeId)

            this.likeRef.ref.get().then(doc => {
                
                const data = <Comments> {
                    likesCount: doc.exists ? post?.likesCount!- 1 : post?.likesCount! + 1
                }

                this.commentRef.set(data, { merge: true })
                !doc.exists ? this.likeRef.set({ user: this.user?.uid }) : this.likeRef.delete()
            })
            
        })
    }

}