const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CEOfficeSchema = new Schema({
    name: { type: String, required: true , unique: true},
    corporation: { type: Schema.Types.ObjectId, ref: 'Corporation', required: true },
    circleOffices: [{ type: Schema.Types.ObjectId, ref: 'CircleOffice' }]
  });
  
  const CEOffice = mongoose.model('CEOffice', CEOfficeSchema);
  module.exports = CEOffice;
  