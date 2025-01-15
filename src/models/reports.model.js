import mongoose from 'mongoose';



const reportedSchema = new mongoose.Schema({
  // The type of entity being reported (content, user, or teacher)
  type: {
    type: String,
    required: true,
    enum: ["Course", "Video", "Comment","Review", "User", "Educator"] // Allowed types
  },
  // ID of the reported entity
  entityReported: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'type', // Dynamic reference to the collection based on type
  },
  // ID of the user who reported
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Reference to the User model
  },
  // Reason for reporting
  reasonTOReport: {
    type: String,
    required: true,
    enum: ["Spam", "Inappropriate", "Hate speech", "Violence", "Other"] // Allowed reasons
  },

  // Additional details for the report
  details: {
    type: String,
    maxlength: 500, // Limit additional details to 500 characters
  },
  resolved:{
    type:Boolean,
    default:false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Report = mongoose.model('Report', reportedSchema);
export default Report;
