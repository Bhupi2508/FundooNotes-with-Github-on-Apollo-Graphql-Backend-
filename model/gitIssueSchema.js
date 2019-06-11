/******************************************************************************
 *  @Execution      : default node          : cmd> gitIssueSchema.js
 *                      
 * 
 *  @Purpose        : MongoDB schema for git issues
 * 
 *  @description    : using this schema we store labels data in database
 * 
 *  @overview       : fundoo application
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 11-june-2019
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
var IssueSchema = new mongoSchema({
    issueID: {
        type: String,
    },
    issueNumber: {
        type: Number
    },
    assignees: [{
        type: String
    }],
    labelName: [{
        type: String,
    }]
},
    {
        timestamps: true
    })


//connect database using mongoose
var userIssue = mongoose.model('gitIssue', IssueSchema);
module.exports = userIssue