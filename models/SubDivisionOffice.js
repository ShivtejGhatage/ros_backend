const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const SubdivisionOfficeSchema = new Schema({
    name: { type: String, required: true , unique: true},
    divisionOffice: { type: Schema.Types.ObjectId, ref: 'DivisionOffice', required: true },
    sectionOffices: [{ type: Schema.Types.ObjectId, ref: 'SectionOffice' }]
  });
  
  const SubdivisionOffice = mongoose.model('SubdivisionOffice', SubdivisionOfficeSchema);
  module.exports = SubdivisionOffice;
  