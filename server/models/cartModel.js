import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  hotelId: { type: String, required: true },
  items: [
    {
      _id: String,
      name: String,
      price: Number,
      image: String,
    },
  ],
});

export default mongoose.model('Cart', cartSchema);
