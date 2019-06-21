/********************************************************************************************************************
 *  @Execution      : default node          : cmd> labelMutation.js
 *                      
 * 
 *  @Purpose        : perform operations by using labelMutation for users
 * 
 *  @description    : create a labels APIs using apollo-graphql 
 * 
 *  @overview       : fundoo application 
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 29-april-2019
 *
 *******************************************************************************************************************/
/**
 * @requires files
 */
const redis = require("async-redis");
const client = redis.createClient({
    host: 'localhost',
    port: process.env.REDIS_PORT
})
var labelModel = require('../../model/labelSchema')
var tokenVerify = require('../../Authentication/authenticationUser')

//create a empty function
var labelMutation = function () { }

//error message
var errorMessage = {
    "message": "Something bad happend",
}

/*******************************************************************************************************************/
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
        var payload = tokenVerify.verification(context.token)
        if (!payload) {
            return { "message": "token is not verify" }
        }
        var labelfind = await labelModel.find({ labelName: params.labelName })

        /**
        @param {number} label.length, check the label name already present or not
        */
        if (labelfind.length > 0) {
            return { "message": "labelName already present" }
        }

        //find id from users models
        const model = new labelModel({ labelName: params.labelName, userID: payload.userID })
        const label = model.save()

        // delete labels from redis
        client.del("labels" + payload.userID)

        /**
         * @return {String}, message
         */
        if (!label) {
            return { "message": "label is not created" }
        } else {
            return { "message": "Label created" }
        }

    } catch (err) {
        if (err instanceof ReferenceError || err instanceof SyntaxError || err instanceof TypeError || err instanceof RangeError) {
            return errorMessage;
        }
        else {
            errorMessage.message = err.message;
            return errorMessage
        }
    }
}

/*******************************************************************************************************************/
/**
* @description : update a APIs for edit lebel for using apollo-graphql
* @purpose : For fetch data by using CURD operation
* @exports editLabel
* @param {number} labelID
* @param {String} editlabelName
*/
labelMutation.prototype.editLabel = async (root, params, context) => {
    try {

        /**
         * @payload send token for verification
         * @condition if present or not
         */
        var payload = tokenVerify.verification(context.token)
        if (!payload) {
            return { "message": "token is not verify" }
        }

        //find id from users models
        var model = await labelModel.findOneAndUpdate({ _id: params.labelID },
            {
                $set: {
                    labelName: params.editlabelName
                }
            })

        /**
         * @return {String} message
         */
        if (!model) {
            return { "message": "label is not updated" }
        } else {
            return { "message": "Label updated" }
        }


    } catch (err) {
        if (err instanceof ReferenceError || err instanceof SyntaxError || err instanceof TypeError || err instanceof RangeError) {
            return errorMessage;
        }
        else {
            errorMessage.message = err.message;
            return errorMessage
        }
    }
}


/*******************************************************************************************************************/
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

        /**
         * @payload send token for verification
         * @condition if present or not
         */
        var payload = tokenVerify.verification(context.token)
        if (!payload) {
            return { "message": "token is not verify" }
        }

        /**
         * @purpose : find id from database then remove from dataase
         * @param {String} id
         * @returns {String} message
         */
        var model = await labelModel.findOneAndRemove({ _id: params.labelID })
        if (!model) {
            return { "message": "label is already removed" }
        } else {
            return { "message": "Label removed" }
        }


    } catch (err) {
        if (err instanceof ReferenceError || err instanceof SyntaxError || err instanceof TypeError || err instanceof RangeError) {
            return errorMessage;
        }
        else {
            errorMessage.message = err.message;
            return errorMessage
        }
    }
}

/**
 * @exports labelMutation
 */
module.exports = new labelMutation()