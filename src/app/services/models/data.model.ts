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

export interface Inbox {
    cid?: string,
}

export interface Comments {
    cid?: string,
    attachment?: Blob | string | undefined,
    commentsCount?: number,
    contentFrom?: string,
    description?: string | undefined,
    likesCount?: number,
    user?: string,
    userRef$?: User | undefined,
    likeRef$?: Likes | undefined,
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
    ranks?: string,
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
    id?: string,
    banned: boolean,
    organization: string,
    position: string,
    roles?: Roles[],
    user: string,
    userRef: User | undefined,
    date: number
}

export interface Chat {
    cid?: string,
    attachment?: Blob | string | undefined,
    attachmentType?: string,
    date?: number,
    content?: string,
    user?: string,
    userRef?: User | undefined,
    reference?: string
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
    banner?: Blob | string | undefined,
    bannerType?: string,
    description?: string,
    gameRef: string,
    icon?: Blob | string | undefined,
    iconType?: string,
    memberCount?: number,
    name: string,
    owner: string,
    oid?: string,
    postCount?: number,
    teamCount?: number,
    snsLink?: [{
        name: string,
        url: string,
        class: string,
        color: string
    }],
    settings?: {
        'direct-join'?: false,
        'lf-player'?: false,
        'lf-team'?: false,
        'lf-coach'?: false,
        'lf-manager'?: false,
    },
    date?: number,
    isApplied?: boolean
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

export interface Events {
    eid?: string,
    cover?: Blob | string | undefined,
    interestedCount?: number,
    topic?: string,
    description?: string | undefined,
    org?: string,
    host?: string,
    hostRef$?: User | undefined,
    orgRef$?: Organization | undefined,
    interestedRef$: Interested | undefined,
    startDate?: number,
    status?: number,
    date?: number
}

export interface Interested {
    user: string | undefined
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
    id?: string,
    bio?: string,
    date?: number,
    gameRef?: string,
    ign?: string,
    rankRef?: string,
    user?: string,
    userRef?: User | undefined,
    isMember: boolean,
    hasTeam?: boolean
}

export interface Ranks {
    id?: string,
    ranks: [{
        divisions?: Divisions,
        icon?: string,
        name?: string,
        tier?: string
    }]
}

export interface Divisions {
    game?: string,
    icon?: string,
    name?: string,
    tier?: number
}

export interface Position {
    id?: string,
    isAdmin?: boolean,
    canCreateRoles?: boolean,
    canRemoveRoles?: boolean,
    canKickMembers?: boolean,
    canBanMembers?: boolean,
    canAddMembers?: boolean,
    canDeleteChatMessages?: boolean,
    canChat?: boolean,
    canDeleteEvent?: boolean,
    canCreateEvent?: boolean,
    canDeletePost?: boolean,
    canCreatePost?: boolean,
}

export interface Roles {
    id?: string,
    icon?: string,
    color?: string,
    name?: string,
    order?: number,
    organization?: string,
    permission?: Position
}

export interface Shares {
    userRef: string
}

export interface Teamates {
    id?: string,
    date: number,
    team?: string,
    user?: string,
    userRef?: User,
    game?: string
}

export interface Teams {
    id?: string,
    bio?: string,
    createdAt?: number,
    description?: string,
    name?: string,
    game?: string,
    icon?: Blob | string | undefined,
    iconType?: string,
    owner?: string,
    rank?: string,
    size?: number,
    count?: number,
    isApplied?: boolean
}

export interface User {
    avatar?: string,
    banned?: boolean,
    banner?: string,
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

export interface Application{
    id?: string,
    bio?: string,
    user?: string,
    organization?: string,
    team?: string,
    userRef?: User,
    date: number
}