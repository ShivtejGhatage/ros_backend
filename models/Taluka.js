const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const TalukaSchema = new Schema({
    name: { type: String, required: true , unique: true},
    dam: [{ type: Schema.Types.ObjectId, ref: 'Dam'}],
    reservoir: [{ type: Schema.Types.ObjectId, ref: 'Reservoir' }]
  });
  
  const Taluka = mongoose.model('Taluka', TalukaSchema);
  module.exports = Taluka;
  