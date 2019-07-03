/*!
 * Module dependencies
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Product schema
 */

const ProductSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    product_level: Number,
    amount: { type: Number, min: 1000 },
    period: { type: Number, enum:[90, 360] },
    order_date: Date,
    start_date: Date,
    end_date: Date,
    static_interest_daily: Number
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

ProductSchema.method({});

/**
 * Statics
 */

ProductSchema.static({});

/**
 * Register
 */

module.exports = mongoose.model('Product', ProductSchema);