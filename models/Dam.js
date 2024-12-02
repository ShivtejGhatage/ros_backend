const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DamSchema = new Schema({
    name: { type: String, required: true , unique: true},
    sectionOffice: { type: Schema.Types.ObjectId, ref: 'SectionOffice', required: true },
    damwater: { type: Number, required: true },
    capacity: { type: Number, required: true },
    capacityTMC: { type: Number, required: true },
    subdam: [{ type: Schema.Types.ObjectId, ref: 'Subdam' }]
  });
  
  const Dam = mongoose.model('Dam', DamSchema);
  module.exports = Dam;
  