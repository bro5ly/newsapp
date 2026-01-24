export class Like {
    constructor(
        public readonly postId: string,
        public readonly userId: string,
        public readonly createdAt: Date
    ) { }
}