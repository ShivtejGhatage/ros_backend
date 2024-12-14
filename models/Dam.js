const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DamSchema = new Schema({
    name: { type: String, required: true , unique: true},
    damwater: { type: Number, required: true },
    capacity: { type: Number, required: true },
    capacityTMC: { type: Number, required: true },
    taluka: { type: Schema.Types.ObjectId, ref: 'Taluka' },
    data: [
      {
        timestamp: { type: Date, default: Date.now },
        level: { type: Number, required: false },
        rain : { type: Number, required: false },
        totalPaaniSatha: { type: Number, required: false },
        visarg_V : { type: Number, required: false },
        visarg_S: { type: Number, required: false },
        username : { type: String, required: false }
      },
    ],
  });
  
  const Dam = mongoose.model('Dam', DamSchema);
  module.exports = Dam;
  