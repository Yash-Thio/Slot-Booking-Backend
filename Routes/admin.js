const express = require("express");
const { User, Slot, Booking } = require("../db");
const { slotType, loginType } = require("../types");
const { default: mongoose } = require("mongoose");
const {authMiddleware} = require('./middleware.js')
const router = express.Router();

router.post('/login', async function(req, res) {
  const loginPayload = req.body;
  const parsedPayload = loginType.safeParse(loginPayload);
  
  if (!parsedPayload.success) {
    return res.status(401).json({
      message: "You have the wrong inputs"
    });
  }

  if (loginPayload.name === "Yash" && loginPayload.email === "p@gmail.com" && loginPayload.password === "123") {
    const token = jwt.sign({
      name: "yash",
      admin: true
    }, "secret");

    const newToken = "Bearer " + token;
    return res.status(200).json({
      message: "Login successful",
      Authorization: newToken,
    });
  } else {
    return res.status(411).json({
      message: "Incorrect email or password"
    });
  }
});


router.put("/createslot",authMiddleware, async (req, res) => {
  const { success } = slotType.safeParse(req.body);

  if (!success){
    return res.status(400).json({
        message : "wrong inputs"
    })
  } 
    const date = req.body.date;
    const time = req.body.time;
    const maxGuests = req.body.maxGuests;

    try {
      await Slot.create({
        date: date,
        time: time,
        maxGuests: maxGuests,
      });
      return res.status(201).json({ 
        message: "Slot successfully created" 
      });
    } catch (error) {
      return res
        .status(500)
        .json({ 
          message: "Error creating slot", error: error.message 
        });
    }
    
    return;
  
});

// router.delete("/removeslot", async(req, res)=>{
//     await db.collection('inventory').deleteOne({ status: 'D' });
//     await db.collection('inventory').deleteMany({ status: 'A' }); 
//     // get id from request and delete the slot
// })


router.put("/confirm",authMiddleware, async (req,res)=>{
  const session = await mongoose.startSession();

  session.startTransaction();

  const { bookingId } = req.body;

  const booking = await Booking.findOne({_id : bookingId});
  if (!booking) return res.status(404).send('Booking not found');

  const slot = await Slot.findOne({_id : booking.slotId});
  if (!slot) return res.status(404).send('Slot not found');

  if (slot.confirmedGuests >= slot.maxGuests) return res.status(400).send('Slot is full');

  booking.status = 'confirmed';
  await booking.save();

  slot.confirmedGuests += 1;
  await slot.save();

  res.status(200).send(booking);

  session.commitTransaction();
});

router.put('/deny',authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  const { bookingId } = req.body;

  const booking = await Booking.findOne({_id: bookingId});
  if (!booking) return res.status(404).send('Booking not found');

  if(booking.status == 'confirmed'){
    const slot = await Slot.findOne({_id : booking.slotId});
    slot.confirmedGuests -= 1;
    await slot.save();
  }

  booking.status = 'denied';
  await booking.save();

  res.status(200).send(booking);

  session.commitTransaction();
});

router.post('/bookings',authMiddleware, async (req,res)=>{
  const slot = await req.body.id;

  try {
    console.log(`Fetching bookings for slot ID: ${slot}`);
    const requests = await Booking.find({slotId : slot});
    const users = await Promise.all(requests.map(async (request) => {
      const user =  await User.findOne({ _id: request.userId });
      if (!user) {
        return null;
      }
      return {
        ...user.toObject(),
        status : request.status,
        requestId : request._id,
      }
    }));
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

module.exports = router;
