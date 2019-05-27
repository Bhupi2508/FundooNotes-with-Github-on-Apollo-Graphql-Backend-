/******************************************************************************
 *  @Execution      : default node          : cmd> nodemon dbConfig.js
 *                      
 * 
 *  @Purpose        : connect mongoDB
 * 
 *  @description    : Using this database we connect mondodb to server
 * 
 *  @overview       : MongoDB connections
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 27-april-2019
 *
 ******************************************************************************/
/**
 * @exports
 */
module.exports = {
    db: process.env.MONGO_PORT,
}
