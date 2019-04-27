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
var userModel = require('../../model/mongoSchema')

//create a empty function
var userQueries = function () { }


/*******************************************************************************************************************/
/**
 * @param {args}
 * @param {context}
 */
userQueries.prototype.user = async (parent, args, context) => {
    var user = await userModel.find()
    console.log(user[0]);
    return user
}


/**
 * @exports userQueries
 */
module.exports = new userQueries()