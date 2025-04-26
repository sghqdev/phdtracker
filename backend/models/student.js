import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    advisor_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Advisor' 
    },
    firstname: { 
        type: String, 
        required: true },
    lastname: { 
        type: String, 
        required: true },
    major: { 
        type: String 
    },
    concentration: { 
        type: String 
    },
    program_status: { 
        type: String 
    }
  }, { timestamps: true });;
  
  const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
  export default mongoose.model('Student', studentSchema);
  