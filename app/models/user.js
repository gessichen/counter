/*!
 * Module dependencies
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User schema
 */

const UserSchema = new Schema({
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    vip_level: {
        type: Number,
        min: 0,
        max: 5
    },

    product_total_amount: { type: Number, default: 0 },
    name: String
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */

UserSchema.method({});

/**
 * Statics
 */

UserSchema.static({});

/**
 * Register
 */

module.exports = mongoose.model('User', UserSchema);