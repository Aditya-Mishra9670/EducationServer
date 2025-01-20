import mongoose from 'mongoose';

const reportedSchema = new mongoose.Schema({
  // The type of entity being reported (content, user, or teacher)
  type: {
    type: String,
    required: true,
    enum: ['content', 'user', 'teacher'], // Allowed types
  },
  // ID of the reported entity
  reportedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'type', // Dynamic reference to the collection based on type
  },
  // ID of the user who reported
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  // Additional details for the report
  details: {
    type: String,
    maxlength: 500, // Limit additional details to 500 characters
  },
  // Status of the report (for admin review)
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'reviewed', 'resolved'], // Workflow statuses
  },
  // Timestamps for record keeping
}, { timestamps: true });

const Reported = mongoose.model('Reported', reportedSchema);

export default Reported;