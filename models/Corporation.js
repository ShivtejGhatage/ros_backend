const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CorporationSchema = new Schema({
  name: { type: String, required: true , unique: true},
  ceOffices: [{ type: Schema.Types.ObjectId, ref: 'CEOffice' }]
});

const Corporation = mongoose.model('Corporation', CorporationSchema);
module.exports = Corporation;

