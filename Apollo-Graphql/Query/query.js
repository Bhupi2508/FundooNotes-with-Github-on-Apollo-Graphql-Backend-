/******************************************************************************
 *  @Execution      : default node          : cmd> query.js
 *                      
 * 
 *  @Purpose        : Generate a queries for users types
 * 
 *  @description    : GraphQL query for specific fields on object and result will come exactly 
 *                    the same shape as request.
 * 
 *  @overview       : fundoo application 
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 28-april-2019
 *
 ******************************************************************************/
/**
 * @requires files
 */
var userModel = require('../../model/userSchema')
var labelModel = require('../../model/labelSchema')

//create a empty function
var userQueries = function () { }


/*******************************************************************************************************************/
/**
 * @param {args}
 * @param {context}
 */
//for user Queries
userQueries.prototype.user = async (parent, args, context) => {
    var user = (await userModel.find().exec() || await userModel.find({ "_id ": args.userID }).exec())
    console.log(user[0]);
    return user
}

//for label quries
userQueries.prototype.labelUser = {
    args: {
        userID: {
            type: GraphQLString
        }
    },
    async(parent, args, context) {
        var labelUser = await labelModel.find({ "userID": args.userID })
        console.log(labelUser[0]);
        return labelUser
    }
}

//for note queries
userQueries.prototype.notesUser = {
    args: {
        userID: {
            type: GraphQLString
        }
    },
    async(parent, args, context) {
        var noteUser = await userModel.find({ "userID": args.userID })
        console.log(noteUser[0]);
        return noteUser
    }
}


/**
 * @exports userQueries
 */
module.exports = new userQueries()