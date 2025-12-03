const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const guestSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an email address"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    // guestID is auto-generated as _id
    fullName: {
      type: String,
    },
    idNumber: {
      type: String,
      unique: true, // Ensures each guest has only one profile
      sparse: true, // Cho phép 'unique' khi có nhiều trường 'null'
    },
    phoneNumber: {
      type: String,
    },
    idScanData: {
      type: String, // Can store a URL to the scanned image or base64 data
    },
    faceEmbedding: {
      type: [Number], // Stored as an array of numbers (vector)
      default: [],
    },
  },
  {
    timestamps: true, // Auto-adds 'createdAt' and 'updatedAt'
  }
);

guestSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const Guest = mongoose.model("Guest", guestSchema);
module.exports = Guest;
