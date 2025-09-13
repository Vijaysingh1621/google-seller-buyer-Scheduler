import mongoose, { Document, Schema } from 'mongoose';

export interface IAvailability extends Document {
  sellerId: mongoose.Types.ObjectId;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // Format: "09:00"
  endTime: string; // Format: "17:00"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AvailabilitySchema = new Schema<IAvailability>({
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
  },
  startTime: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
  },
  endTime: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Composite index to ensure one availability per seller per day
AvailabilitySchema.index({ sellerId: 1, dayOfWeek: 1 }, { unique: true });

export default mongoose.models.Availability || mongoose.model<IAvailability>('Availability', AvailabilitySchema);