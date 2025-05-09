import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
    },
    socketId: {
        type: String,
        default: null,
    },
    location: {
        lat: { type: Number },
        lng: { type: Number },
    },
    blockedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    isOnline: {
        type: Boolean,
        default: false,
    },
    token: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
