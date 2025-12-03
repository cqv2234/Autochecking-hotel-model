const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    // roomID is auto-generated as _id
    roomNumber: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicate room numbers
    },
    roomName: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      required: true,
      enum: ["Standard", "Deluxe", "Suite"], // Only allows these values
    },
    description: {
      type: String,
      default: "", // Set default description to an empty string
    },
    maxGuests: {
      type: Number,
      required: true,
      default: 2,
    },
    price: {
      type: Number,
      required: [true, "Please provide the price per night for this room"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Available", "Occupied", "Cleaning", "Maintenance"],
      default: "Available", // Default status when creating a new room
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
