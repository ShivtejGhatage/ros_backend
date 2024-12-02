const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const DivisionOfficeSchema = new Schema({
    name: { type: String, required: true , unique: true},
    circleOffice: { type: Schema.Types.ObjectId, ref: 'CircleOffice', required: true },
    subdivisionOffices: [{ type: Schema.Types.ObjectId, ref: 'SubdivisionOffice' }]
  });
  
  const DivisionOffice = mongoose.model('DivisionOffice', DivisionOfficeSchema);
  module.exports = DivisionOffice;
  