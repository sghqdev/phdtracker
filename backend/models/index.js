// import { number, string } from "joi";
import mongoose from "mongoose";

const project = new mongoose.Schema({
    title: {
        type: String,
        unique: true // `email` must be unique
    },
    description: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Making it optional for backward compatibility with existing data
    },
    task: [
        {
            id: Number,
            title: String,
            description: String,
            order: Number,
            stage: String,
            index: Number,
            attachment: [
                { type: String, url: String }
            ],
            created_at: { type: Date, default: Date.now },
            updated_at: { type: Date, default: Date.now },
        }
    ]
}, { timestamps: true })


export default mongoose.model('Project', project);