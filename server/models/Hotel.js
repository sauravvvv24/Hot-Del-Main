// models/Hotel.js
import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  type: { type: String, required: true },
}, { timestamps: true });

const HotelModel = mongoose.model('Hotel', hotelSchema);
export default HotelModel;
