const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
    inventoryType: {
        type: String,
        require: [true, 'Inventory type require'],
        enum: ['in', 'out']
    },
    bloodGroup: {
        type: String,
        require: [true, 'Blood group is require'],
        enum: ['O+', 'O-', 'AB+', 'AB-', 'A+', 'A-', 'B+', 'B-'],
    },
    quantity: {
        type: Number,
        require: [true, 'Blood quantity is require']
    },
    email: {
        type: String,
        require: [true, 'Email is require']
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        require: function() {
            return this.inventoryType === "in";
        },
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        require: function() {
            return this.inventoryType === "out";
        },
    },
    donar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        require: function() {
            return this.inventoryType === "in";
        },
    },
}, {timestamps: true});

module.exports = mongoose.model('Inventory', inventorySchema);