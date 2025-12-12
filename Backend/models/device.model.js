import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema ({
    deviceID:{
        type: String,
        required: true,
},
isOnline:{
    type: Boolean,
    default: false,
 },
isRaining:{
    type: Boolean,
    required: true,
    default: false
},
isSunny:{
    type: Boolean,
    required: true,
    default: false
},
temperature:{
    type: Number,
    required: true,
    default: 0
},
humidity:{
    type: Number,
    required: true,
    default: 0
},

lastUpdate:{
    type: Number,
    required: true,
    default: 0
}

});

const Device = mongoose.model('Device', DeviceSchema);

export default Device;