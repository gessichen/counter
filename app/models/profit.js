/*!
 * Module dependencies
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Profit schema
 */

const ProfitSchema = new Schema({
    user_id: {
        type: String,
        required: true,
        unique: true
    },


    static_profit: { type: Number, default: 0 },
    generate_profit: { type: Number, default: 0 },
    group_profit: { type: Number, default: 0 },
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

ProfitSchema.method({});

/**
 * Statics
 */

ProfitSchema.static({});

/**
 * Register
 */

module.exports = mongoose.model('Profit', ProfitSchema);