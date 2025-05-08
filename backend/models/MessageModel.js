    import mongoose from 'mongoose';

    const messageSchema = new mongoose.Schema(
        {
            chat: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Chat',
            },
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            content: {
                type: String,
            },
            media: [
                {
                    url: String,
                    type: { type: String, enum: ['image', 'video'] },
                    caption: String,
                },
            ],
            type: { type: String, enum: ['text', 'media'] },
            isSeen: {
                type: Boolean,
                default: false,
            },
        },
        { timestamps: true }
    );

    export default mongoose.model('Message', messageSchema);
