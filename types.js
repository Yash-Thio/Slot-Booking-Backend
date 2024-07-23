const zod = require('zod');

const slot = zod.object({
    date : zod.string(),
    time : zod.string(),
    maxGuests : zod.number()
});

const user = zod.object({
    name: zod.string(),
    email: zod.string().email(),
    phoneNumber: zod.number(),
    address: zod.string()
});

const login = zod.object({
    name : zod.string(),
    email : zod.string().email(),
    password : zod.string(),
});

module.exports = {
    slotType : slot,
    userType : user,
    loginType : login,
}