/********************************************************************************************************************
 *  @Execution      : default node          : cmd> labelMutation.js
 *                      
 * 
 *  @Purpose        : perform operations by using labelMutation for users
 * 
 *  @description    : create a labels APIs using apollo-graphql 
 * 
 *  @overview       : fundoo application 
 *  @author         : Bhupendra Singh
 *  @version        : 1.0
 *  @since          : 29-april-2019
 *
 *******************************************************************************************************************/
/**
 * @requires files
 */
var { errorResponse } = require('../../services/errors');
const redis = require("async-redis");
const client = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT
})
var labelModel = require('../../model/labelSchema')
var tokenVerify = require('../../Authentication/authenticationUser')

//create a empty function
var labelMutation = function () { }


/******************************************************   createLabel   *************************************************************/
/**
 * @description : create a APIs for add lebel for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @exports createLabel
 * @param {*} root 
 * @param {*} params
 * @param {*} context
*/
labelMutation.prototype.createLabel = async (root, params, context) => {
    try {
        var payload = tokenVerify.requireUser(context)


        /**
         * @param {number} Name validation 
         */
        if (params.labelName.length < 4) {
            return { "message": "Enter name min 4 letter " }
        }



        /**
         * @payload send token for verification
         * @condition if present or not
         */
        var labelfind = await labelModel.find({ labelName: params.labelName, userID: payload.userID })



        /**
        @param {number} label.length, check the label name already present or not
        */
        if (labelfind.length > 0) {
            return { "message": "labelName already present" }
        }



        //find id from users models
        const model = new labelModel({ labelName: params.labelName, userID: payload.userID })
        const label = await model.save()


        // delete labels from redis
        await client.del("labels" + payload.userID)


        /**
         * @return {String}, message
         */
        if (!label) {
            return { "message": "label is not created" }
        } else {
            return { "message": "Label created" }
        }


    } catch (err) {
        return errorResponse(err)
    }
}





/**********************************************************   editLabel   *********************************************************/
/**
* @description : update a APIs for edit lebel for using apollo-graphql
* @purpose : For fetch data by using CURD operation
* @exports editLabel
* @param {number} labelID
* @param {String} editlabelName
*/
labelMutation.prototype.editLabel = async (root, params, context) => {
    try {
        var payload = tokenVerify.requireUser(context)


        /**
         * @payload send token for verification
         * @condition if present or not
         */



        //find id from users models
        var model = await labelModel.findOneAndUpdate({ _id: params.labelID, userID: payload.userID },
            {
                $set: {
                    labelName: params.editlabelName
                }
            })
        await client.del("labels" + payload.userID)

        if (!model) {
            return { "message": "label is not updated" }
        } else {
            return { "message": "Label updated" }
        }


    } catch (err) {
        return errorResponse(err)
    }
}


/********************************************************   removeLabel   ***********************************************************/
/**
* @description : remove APIs for remove label for using apollo-graphql
* @purpose : For fetch data by using CURD operation
* @exports removeLabel
* @param {*} root
* @param {*} params
* @param {*} context
*/
labelMutation.prototype.removeLabel = async (root, params, context) => {
    try {
        var payload = tokenVerify.requireUser(context)


        /**
         * @payload send token for verification
         * @condition if present or not
         */



        /**
         * @purpose : find id from database then remove from dataase
         * @param {String} id
         * @returns {String} message
         */
        var model = await labelModel.findOneAndRemove({ _id: params.labelID, userID: payload.userID })
        await client.del("labels" + payload.userID)
        if (!model) {
            return { "message": "label is already removed" }
        } else {
            return { "message": "Label removed" }
        }


    } catch (err) {
        return errorResponse(err)
    }
}

/**
 * @exports labelMutation
 */
module.exports = new labelMutation()