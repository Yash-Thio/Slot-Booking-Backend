const mongoose = require('mongoose');
const { string } = require('zod');

const db = mongoose.connect('mongodb+srv://admin:A7UFVkazXx0X6QBR@cluster0.rjeg2mc.mongodb.net/slot_booking');

const userSchema = mongoose.Schema({
    name : { type : String, required: true },
    email : { type : String, required: true },
    phoneNumber : { type : Number, required: true },
    address : { type : String, required: true }
})

const slotSchema = mongoose.Schema({
    date : { type: String, required: true },
    time : { type: String, required: true },
    maxGuests : { type: Number, required: true },
    confirmedGuests : { type: Number, default: 0 }
})

const bookingSchema = mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    slotId: { type: mongoose.Types.ObjectId, ref: 'Slot', required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'denied'], default:"pending", required: true }
})

const User = mongoose.model('User', userSchema);
const Slot = mongoose.model('Slot', slotSchema);
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = {
    User,
    Slot,
    Booking
}