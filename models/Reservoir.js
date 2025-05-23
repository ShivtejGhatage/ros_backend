const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ReservoirSchema = new mongoose.Schema({
  name: { type: String, required: true , unique: true},
  sectionOffice: { type: Schema.Types.ObjectId, ref: 'SectionOffice', required: true },
  subdam: { type: Schema.Types.ObjectId, ref: 'Subdam', required: true },
  alertL: { type: Number, required: true },
  dangerL : { type: Number, required: true },
  lowL : { type: Number, required: true },
  waterLevels: [
    {
      timestamp: { type: Date, default: Date.now },
      level: { type: Number, required: false },
      rain : { type: Number, required: false },
      username : { type: String, required: false }
    },
  ],
});

module.exports = mongoose.model('Reservoir', ReservoirSchema);
