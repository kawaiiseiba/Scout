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
    dateGranted: Date,
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
    userRef: string
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
    userRef: string
}

export interface Members {
    banned: boolean,
    organizationRef: string,
    roleRef: string,
    userRef: string 
}

export interface Messages {
    dateSent: Date,
    description: string,
    userRef: string 
}

export interface News {
    banner?: string,
    content: string,
    dateAdded: Date,
    description?: string,
    gameRef: string,
    publishedBy: string,
    title: string 
}

export interface Notifications {
    dateNotified: Date,
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
    attachment?: string,
    comments?: Map<string, CommentRef>,
    commentsCount: number,
    description?: string,
    likes?: Map<string, LikeRef>,
    likesCount: number,
    shares?: Map<string, ShareRef>,
    userRef: string
}

export interface Prostring {
    bio?: string,
    dateAdded: Date,
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
    dateJoined: Date,
    teamRef: string,
    userRef: string
}

export interface Teams {
    bio?: string,
    createdAt: Date,
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
    email?: string,
    joined?: Date,
    messages?: Map<string, MessageRef>,
    notifications?: Map<string, NotificationRef>,
    organizationRef?: string,
    prostrings?: Map<string, ProstringRef>,
    teams?: Map<string, TeamRef>,
    selectedGame?: string,
    username?: string,
    uid?: string
}
