/******************************************************************************
 *  @Execution      : default node          : cmd> nodemon authenticationUser.js
 *                      
 * 
 *  @Purpose        : verification 
 * 
 *  @description    : token verification by using jsonWebToken
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
var jwt = require('jsonwebtoken');


/**
 * @exports verification
 */
exports.verification = (token) => {
    try {

        /**
         * @param {String}, secretKey is string used for hidden data
         * @return {String}, value of verify token
         * @param {String}, secretKey
         */
        var value = jwt.verify(token, process.env.secretKey)
        return value
    }
    catch (err) {
        console.log("found error in verify token")
        return { "message": err }
    }
}
