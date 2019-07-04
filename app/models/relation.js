/*!
 * Module dependencies
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Relation schema
 */

const RelationSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    invitor_id: String,

    path: String
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

RelationSchema.method({});

/**
 * Statics
 */

RelationSchema.static({});

/**
 * Register
 */

module.exports = mongoose.model('Relation', RelationSchema);