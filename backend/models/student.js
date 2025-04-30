import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    advisorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    firstname: { 
        type: String, 
        required: true 
    },
    lastname: { 
        type: String, 
        required: true 
    },
    major: { 
        type: String 
    },
    concentration: { 
        type: String 
    },
    programStatus: { 
        type: String,
        default: 'Active'
    },
    email: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
  