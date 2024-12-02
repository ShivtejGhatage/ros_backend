const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CircleOfficeSchema = new Schema({
    name: { type: String, required: true , unique: true},
    ceOffice: { type: Schema.Types.ObjectId, ref: 'CEOffice', required: true },
    divisionOffices: [{ type: Schema.Types.ObjectId, ref: 'DivisionOffice' }]
  });
  
  const CircleOffice = mongoose.model('CircleOffice', CircleOfficeSchema);
  module.exports = CircleOffice;
  