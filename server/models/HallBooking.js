const mongoose = require('mongoose');

const hallBookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  hall: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SeminarHall', 
    required: true 
  },
  hallName: { type: String, required: true },
  hod: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  hodName: { type: String, required: true },
  department: { type: String, required: true },
  eventName: { type: String, required: true },
  eventType: { 
    type: String, 
    enum: ['Guest Lecture', 'Workshop', 'Conference', 'Faculty Development Program', 'Student Seminar', 'Placement / Technical Talk', 'Department Association', 'Other'],
    default: 'Guest Lecture' 
  },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  fromDate: { type: String },              // Format: YYYY-MM-DD
  toDate: { type: String },                // Format: YYYY-MM-DD
  isMultiDay: { type: Boolean, default: false },
  slot: { 
    type: String, 
    enum: ['FN', 'AN', 'FULL_DAY', 'CUSTOM'], 
    required: true 
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  expectedAudience: { type: Number, required: true },
  chiefGuest: { type: String, default: '' },
  requirements: {
    projector: { type: Boolean, default: true },
    soundSystem: { type: Boolean, default: true },
    airConditioning: { type: Boolean, default: true },
    podiumMic: { type: Boolean, default: true },
    videoRecording: { type: Boolean, default: false },
    specialArrangements: { type: String, default: '' }
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  coordinator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  coordinatorRemarks: { type: String, default: '' },
  actionDate: { type: Date, default: null },
  cancellationReason: { type: String, default: '' },
  cancelledAt: { type: Date, default: null },
  passNumber: { type: String, default: '' },
  passSentToHod: { type: Boolean, default: false },
  passSentAt: { type: Date, default: null },
  passViewedByHod: { type: Boolean, default: false },
  coordinatorSignature: { type: String, default: '' }
}, { timestamps: true });

// Auto-generate booking ID & normalize date fields
hallBookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.bookingId = `NEC-SH-${new Date().getFullYear()}-${randomNum}`;
  }
  if (!this.fromDate && this.date) {
    this.fromDate = this.date;
  }
  if (!this.toDate) {
    this.toDate = this.fromDate || this.date;
  }
  if (!this.date && this.fromDate) {
    this.date = this.fromDate;
  }
  if (this.fromDate && this.toDate && this.fromDate !== this.toDate) {
    this.isMultiDay = true;
  }
  next();
});

module.exports = mongoose.model('HallBooking', hallBookingSchema);
