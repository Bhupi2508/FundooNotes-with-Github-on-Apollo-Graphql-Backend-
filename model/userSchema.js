/******************************************************************************
 *  Execution       : default node          : cmd> mongoSchema.js
 *                      
 * 
 *  Purpose         : MongoDB schema for Users
 * 
 *  @description    : using this schema we store users data in database
 * 
 *  @overview       : fundoo application
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 27-april-2019
 *
 ******************************************************************************/
/**
 * @requires files
 */
var mongoose = require('mongoose')

//create instance of Schema
var mongoSchema = mongoose.Schema;


/**
 * @purpose : store data in database based on this schema
 * @param {String} firstname
 * @param {String} lastname
 * @param {String} email
 * @param {String} password
 * @param {timestamps} timestamps
 * @param {Boolean} verification
 * @param {Boolean} isGitVerify
 * @param {String} loginName
 * @param {String} gitID
 * @param {String} access_Token
 * @param {String} ProfilePicUrl 
 */
var schemaData = new mongoSchema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    verification: {
        type: Boolean,
        default: false
    },
    isGitVerify: {
        type: Boolean,
        default: false
    },
    loginName: {
        type: String,
    },
    gitID: {
        type: String,
    },
    gitNodeID: {
        type: String,
    },
    access_Token: {
        type: String,
    },
    ProfilePicUrl: {
        type: String
    }
}, {
        timestamps: true
    })


//connect database using mongoose
var user = mongoose.model('user', schemaData);

/**
 * @exports user
 */
module.exports = user