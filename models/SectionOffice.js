const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SectionOfficeSchema = new Schema({
    name: { type: String, required: true , unique: true},
    subdivisionOffice: { type: Schema.Types.ObjectId, ref: 'SubdivisionOffice', required: true },
    dams: [{ type: Schema.Types.ObjectId, ref: 'Dam' }]
  });
  
  const SectionOffice = mongoose.model('SectionOffice', SectionOfficeSchema);
  module.exports = SectionOffice;
  