const express = require("express");
const { User, Slot, Booking } = require("../db");
const { userType } = require("../types");
const router = express.Router();
const mongoose = require('mongoose');

router.post('/requestslot', async (req, res) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    
    const { userId, slotId } = req.body;

    const user = await User.findOne({_id : userId});
    if(!user) return res.status(400).json({
        message : 'User does not exist'
    });

    const slot = await Slot.findOne({_id : slotId});
    if(!slot) return res.status(400).json({
        message : 'Slot does not exist'
    });
    if(slot.confirmedGuests >= slot.maxGuests) return res.status(200).json({
        message : 'slot is full'
    })
  
    const existingBooking = await Booking.findOne({ userId : userId , status: { $in: ['pending', 'confirmed'] } });
    if (existingBooking) return res.status(400).json({
        message : 'User already has a pending or confirmed booking'
    });
  
    
    try {
        await Booking.create({
          userId: userId,
          slotId: slotId
        });
        res.status(201).json({ 
          message: "Booking successfully created" 
        });
      } catch (error) {
        res.status(500).json({ 
            message: "Error creating booking", error: error.message 
          });
      }

      session.commitTransaction();
  });

  router.post("/createuser", async (req,res)=>{

    const { success } = userType.safeParse(req.body);
    if (!success){
      return res.status(400).json({
          message : "wrong inputs"
      })
    } 

    const {name, email, phoneNumber, address} = req.body;

    const user = await User.findOne({name:name, email:email, phoneNumber: phoneNumber});
    if(user) return res.status(200).send(user._id);

    try {
        const newUser = await User.create({
          name: name,
          email: email,
          phoneNumber: phoneNumber,
          address: address
        });
        res.status(201).send(newUser._id)
      } catch (error) {
        res.status(500).json({ 
            message: "Error creating user", error: error.message 
          });
      }
  })

module.exports = router;