import { Observable } from "rxjs"

type MessageRef = { messageRef: string }
type NotificationRef = { notificationRef: string }
type ProstringRef = { prostringRef: string }
type TeamRef = { teamRef: string }
type RankRef = { rankRef: string }
type CommentRef = { commentRef: string }
type LikeRef = { likeRef: string }
type ShareRef = { shareRef: string }
type MemberRef = { memberRef: string }
type PostRef = { postRef: string }
type RoleRef = { roleRef: string }
type OrganizationRef = { organizationRef: string }
type UserRef = { userRef: string }
type NewsRef = { newRef: string }
type TierRef = { icon: string, mark: number}

export interface Admins {
    dateGranted: number,
    isAdmin: boolean,
    userRef:string 
}

export interface Chats {
    messages: Map<string, MessageRef>,
    users: {
        fromRef: string,
        toRef: string  
    }
}

export interface Comments {
    cid?: string,
    attachment?: Blob | string | undefined,
    commentsCount?: number,
    contentFrom?: string,
    description?: string | undefined,
    likesCount?: number,
    user?: string,
    reference?: string,
    referenceType?: string,
    date?: number
}

export interface Games {
    banner?: string,
    baseURL: string,
    description?: string,
    icon?: string,
    id?: string,
    name?: string,
    bgColor?: string,
    textColor?: string,
    organizations?: Map<string, OrganizationRef>,
    organizationCount?: number,
    posts?: Map<string, PostRef>,
    publisher?: string,
    ranks?: Map<string, RankRef>,
    roles?: Map<string, RoleRef>,
    teams?: Map<string, TeamRef>,
    teamCount?: number,
    users?: Map<string, UserRef>,
    userCount?: number,
    websiteUrl?: string,
    news?: Map<string, NewsRef>
}

export interface Likes {
    user: string | undefined
}

export interface Members {
    banned: boolean,
    organizationRef: string,
    roleRef: string,
    userRef: string 
}

export interface Messages {
    dateSent: number,
    description: string,
    userRef: string 
}

export interface News {
    banner?: string,
    content: string,
    dateAdded: number,
    description?: string,
    gameRef: string,
    publishedBy: string,
    title: string 
}

export interface Notifications {
    dateNotified: number,
    type: string,
    userRef: string
}

export interface Organization {
    banner?: string,
    description?: string,
    gameRef: string,
    icon?: string,
    memberCount: number,
    members?: Map<string, MemberRef>,
    name: string,
    owner: string,
    postCount: number,
    posts?: Map<string, PostRef>,
    roles?: Map<string, RoleRef>,
    teamCount: number,
    teams?: Map<string, TeamRef>
}

export interface Posts {
    pid?: string,
    attachment?: Blob | string | undefined,
    commentsCount?: number,
    contentFrom?: string,
    description?: string | undefined,
    likesCount?: number,
    sharesCount?: number,
    user?: string,
    userRef$?: User | undefined,
    likeRef$?: Likes | undefined,
    gameRef$?: Games | undefined,
    date?: number
}

export interface PostClarity {
    pid?: string,
    attachment?: Blob | string | undefined,
    commentsCount?: number,
    contentFrom?: string,
    description?: string | undefined,
    likesCount?: number,
    sharesCount?: number,
    user?: string,
    userRef$?: User | undefined,
    likeRef$?: Likes | undefined,
    gameRef$?: Games | undefined,
    date?: number,
}

export interface Profile {
    bio?: string,
    dateAdded: number,
    gameRef: string,
    ign: string,
    rankRef: string
}

export interface Ranking {
    gameRef: string,
    ranks: Map<string, RankRef>
}

export interface Ranks {
    divisions: {
        name: string
    },
    gameRef: string,
    stage: number,
    tiers: Map<string, TierRef>
}

export interface Roles {
    level: number,
    name: string
}

export interface Shares {
    userRef: string
}

export interface Teamates {
    dateJoined: number,
    teamRef: string,
    userRef: string
}

export interface Teams {
    bio?: string,
    createdAt: number,
    description?: string,
    gameRef: string,
    icon?: string,
    owner: string,
    rankRef: string,
    size: number,
    teamates?: Map<string, TeamRef>
}

export interface User {
    avatar?: string,
    banned?: boolean,
    banner?: string,
    bio?: string,
    contactNumber?: string,
    defaultAvatar?: string,
    displayName?: string,
    email?: string,
    joined?: number,
    messages?: {},
    notifications?: {},
    organizationRef?: string,
    postsRef?: {},
    teams?: {},
    selectedGame?: string,
    username?: string,
    uid?: string
}
