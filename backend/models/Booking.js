const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    // bookingID is auto-generated as _id
    guest: {
      // Renamed from guestID for convention
      type: Schema.Types.ObjectId,
      ref: "Guest", // Refers to the 'Guest' model
      required: true,
    },
    room: {
      // Renamed from roomID
      type: Schema.Types.ObjectId,
      ref: "Room", // Refers to the 'Room' model
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    adults: {
      type: Number,
      required: true,
      default: 1,
    },
    children: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: [
        true,
        "Please provide the total price of all nights for this room",
      ],
    },
    status: {
      type: String,
      required: true,
      enum: ["Confirmed", "CheckedIn", "CheckedOut", "Cancelled"],
      default: "Confirmed",
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
