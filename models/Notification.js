const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  reservoir: { type: Schema.Types.ObjectId, ref: 'Reservoir', required: true },
  message: { type: String, required: true },
  color: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
