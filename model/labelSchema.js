/******************************************************************************
 *  @Execution      : default node          : cmd> labelSchema.js
 *                      
 * 
 *  @Purpose        : MongoDB schema for labels
 * 
 *  @description    : using this schema we store labels data in database
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
 * @param {number} userID
 * @param {String} labelName
 * @param {timestamps} timestamps
 */
var labelSchema = new mongoSchema({
    userID: {
        type: mongoSchema.Types.ObjectId,
        ref: 'schemaData'
    },
    labelName: {
        type: String,
        required: [true, "labelName is required"]
    }
},
    {
        timestamps: true
    })
    

//connect database using mongoose
var userLabel = mongoose.model('label', labelSchema);
module.exports = userLabel