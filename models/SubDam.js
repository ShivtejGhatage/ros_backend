const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const SubdamSchema = new Schema({
    name: { type: String, required: true , unique: true},
    dam: { type: Schema.Types.ObjectId, ref: 'Dam', required: false },
    reservoir: [{ type: Schema.Types.ObjectId, ref: 'Reservoir' }]
  });
  
  const Subdam = mongoose.model('Subdam', SubdamSchema);
  module.exports = Subdam;
  