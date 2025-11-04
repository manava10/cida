import mongoose from 'mongoose';

const AuditEventSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: true },
    ip: { type: String },
    userAgent: { type: String },
    metadata: { type: Object }
  },
  { timestamps: true }
);

export const AuditEvent = mongoose.model('AuditEvent', AuditEventSchema);


