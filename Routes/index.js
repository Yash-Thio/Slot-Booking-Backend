const express = require('express');
const router = express.Router();
const userRouter = require('./user');
const adminRouter = require('./admin');
const {Slot} = require('../db')

router.use('/user', userRouter)
router.use('/admin', adminRouter)

router.get("/slots", async (req,res)=>{
    try {
      const slots = await Slot.find();
      res.status(200).json(slots);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching slots', error: error.message });
    }
})

module.exports = router;