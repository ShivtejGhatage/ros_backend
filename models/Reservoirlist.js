const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReservoirListSchema = new mongoose.Schema({
    name: { type: String, required: true , unique: true},
    dam: { type: Schema.Types.ObjectId, ref: 'Dam', required: true },
    subdam: { type: Schema.Types.ObjectId, ref: 'Subdam', required: true },
    alertL: { type: Number, required: true },
   dangerL : { type: Number, required: true },
    lowL : { type: Number, required: true }
});

module.exports = mongoose.model('ReservoirList', ReservoirListSchema);
