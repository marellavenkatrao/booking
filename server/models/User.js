const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['HOD', 'COORDINATOR', 'AO'], 
    required: true 
  },
  roles: [{
    type: String,
    enum: ['HOD', 'COORDINATOR', 'AO']
  }],
  department: { type: String, default: '' },
  designation: { type: String, default: '' },
  assignedHall: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SeminarHall',
    default: null 
  },
  phone: { type: String, default: '' },
  landline: { type: String, default: '' }
}, { timestamps: true });

userSchema.pre('save', function(next) {
  if (!this.roles || this.roles.length === 0) {
    this.roles = [this.role];
  }
  next();
});

module.exports = mongoose.model('User', userSchema);

