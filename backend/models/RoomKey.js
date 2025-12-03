const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomKeySchema = new Schema(
  {
    // keyID is auto-generated as _id
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking", // Refers to the 'Booking' that owns this key
      required: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room", // Refers to the 'Room' this key can open
      required: true,
    },
    activationTime: {
      type: Date,
      default: Date.now, // Automatically set to now when created
    },
    expirationTime: {
      type: Date,
      required: true, // Must be set (from Booking.checkOutDate)
    },
    status: {
      type: String,
      enum: ["Inactive", "Active", "Deactivated"],
      default: "Inactive",
    },
  },
  {
    timestamps: true,
  }
);

roomKeySchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const RoomKey = mongoose.model("RoomKey", roomKeySchema);
module.exports = RoomKey;
