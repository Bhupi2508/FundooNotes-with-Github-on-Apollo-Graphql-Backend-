/******************************************************************************
 *  @Execution      : default node          : cmd> noteSchema.js
 *                      
 * 
 *  @Purpose        : MongoDB schema for notes
 * 
 *  @description    : using this schema we store notes data in database
 * 
 *  @overview       : fundoo application
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 29-april-2019
 *
 ******************************************************************************/
/**
 * @requires files
 */
var mongoose = require('mongoose');

//connect the schema with database
var mongoSchema = mongoose.Schema;

/**
 * @purpose : store data in database based on this schema
 * @param {String} userID 
 * @param {String} title  
 * @param {String} description 
 * @param {String} reminder  
 * @param {String} archieve
 * @param {String} trash
 * @param {String} pin
 * @param {Array} label
 * @param {timestamps} timestamps
 */
var noteSchema = new mongoSchema({
    userID: {
        type: mongoSchema.Types.ObjectId,
        ref: 'schemaData'
    },
    title: {
        type: String,
        required: [true, "title is required"],
        minlength: [2, 'min length is 2 for title'],
        maxlength: [200, 'max length 200 for title']
    },
    description: {
        type: String,
    },
    reminder: {
        type: Date
    },
    archieve: {
        type: Boolean,
        default: false
    },
    trash: {
        type: Boolean,
        default: false
    },
    pin: {
        type: Boolean,
        default: false
    },
    labelID: [{
        type: mongoSchema.Types.ObjectId,
        ref: 'labelSchema'
    }]
},
    {
        timestamps: true
    })


//connect database using mongoose
var notes_Schema = mongoose.model('notes', noteSchema);


/**
 * @exports userLabel
 */
module.exports = notes_Schema