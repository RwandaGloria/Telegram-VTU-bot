/* eslint-disable linebreak-style */
// Mongodb to hold user detail and wallet balance.

const mongoose = require('mongoose');

const { Schema } = mongoose;

const CouponCodeSchema = new Schema({
  couponCode: {
    type: String,
    required: true,
  },
  senderTGID: {
    type: String,
    required: true,
  },
  senderTG_Name: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: true,
  },
  isUsed: {
    type: Boolean,
    required: true,
    default: false,
  },
  isExpired:
  {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  recipientID: {
    type: String,
    required: false,
    default: '',
  },
  dataAmount: {
    type: String,
    required: false,
    default: '',
  },
  network: {
    type: String,
    required: false,
    default: '',
  },
  couponUsedDate: {
    type: Date,
    required: false,
  },
  couponExpiryDate: {
    type: Date,
    required: false,
  },
});
const couponCodes = mongoose.model('couponCodes_telegram', CouponCodeSchema);
module.exports = couponCodes;
