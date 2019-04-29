/********************************************************************************************************************
 *  @Execution      : default node          : cmd> noteMutation.js
 *                      
 * 
 *  @Purpose        : perform operations by using users
 * 
 *  @description    : By using mutation create a new files and fetch the data
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
var noteModel = require('../../model/noteSchema')
var labelModel = require('../../model/labelSchema')
var tokenVerify = require('../../Authentication/authenticationUser')

//create a empty function
var noteMutation = function () { }

/*******************************************************************************************************************/
/**
 * @description : create a APIs for add notes for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {*} root 
 * @param {*} params
 * @param {*} context
 */
noteMutation.prototype.createNote = async (root, params, context) => {
    try {

        /**
         * @param {String} title validation 
         * @param {String} description validation
         */
        if (params.title.length < 3) {
            return { "message": "Enter title length min 3 letter " }
        }
        if (params.description.length < 4) {
            return { "message": "Enter description length min 4 letter " }
        }


        /**
         * @payload send token for verification
         * @condition if present or not
         * @returns {String} message
         */
        var payload = tokenVerify.verification(context.token)
        if (!payload) {
            return { "message": "token is not verify" }
        }


        //find title from database
        var notefind = await noteModel.find({ title: params.title })

        /**
         * @param {number} notefind.length, check the label name already present or not
         * @returns {String} message
         */
        if (notefind.length > 0) {
            return { "message": "title already present" }
        }


        //find id from users models
        const model = new noteModel({
            title: params.title,
            description: params.description,
            reminder: params.reminder,
            color: params.color,
            img: params.img,
            userID: payload.userID

        })
        const note = model.save()


        /**
         * @return {String}, message
         */
        if (!note) {
            return { "message": "note is not created" }
        } else {
            return { "message": "note created" }
        }

    } catch (error) {
        console.log("error in catch")
        return { "message": err }
    }
}


/*******************************************************************************************************************/
/**
 * @description : update data APIs for updated notes for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {token}
 * @purpose : update title or description from database
 * @param {params} params
 */
noteMutation.prototype.editNote = async (root, params) => {
    try {

        //find id from users models
        var note = await noteModel.findOneAndUpdate({ _id: params.noteID },
            {
                $set: {
                    title: params.editTitle
                }
            })

        /**
         * @return {String} message
         */
        if (!note) {
            return { "message": "note is not updated" }
        } else {
            return { "message": "note updated" }
        }


    } catch (error) {
        console.log("error")
        return { "message": err }
    }
}


/*******************************************************************************************************************/
/**
 * @description : remove APIs for remove note for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {*} root
 * @param {*} params
 */
noteMutation.prototype.removeNote = async (root, params) => {
    try {

        /**
         * @purpose : find id from database then remove from dataase
         * @param {String} id
         * @returns {String} message
         */
        var note = await noteModel.findOneAndRemove({ _id: params.noteID })
        if (!note) {
            return { "message": "note is not present" }
        } else {
            return { "message": "note removed" }
        }


    } catch (error) {
        console.log("error")
        return { "message": err }
    }
}



/*******************************************************************************************************************/
/**
 * @description : save label into notes APIs for updated notes for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {*} root
 * @param {*} params 
 */
noteMutation.prototype.saveLabelToNote = async (root, params) => {
    try {

        //find labelID from noteModel Schema
        var id = await noteModel.find({ "labelID": params.label_ID })

        //if id is already present
        if (id.length > 0) {
            return { "message": "This label is already added in note" }
        }

        //find id from noteModel and update(push) into notes
        var note = await noteModel.findOneAndUpdate({ _id: params.noteID },
            {
                $push: {
                    labelID: params.label_ID
                }
            })

        /**
         * @return {String}, message
         */
        if (!note) {
            return { "message": "label not added " }
        } else {
            return { "message": "label added on note successfully " }
        }

    } catch (error) {
        console.log("error in catch")
        return { "message": err }
    }
}


/*******************************************************************************************************************/
/**
 * @description : save label into notes APIs for updated notes for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {*} root
 * @param {*} params
 */
noteMutation.prototype.removeLabelFromNote = async (root, params) => {
    try {

        //find labelID from noteModel Schema
        var id = await noteModel.find({ "labelID": params.label_ID })

        //if id is already present
        if (!id.length > 0) {
            return { "message": "This label is not present in notes" }
        }

        //find id from noteModel and update(push) into notes
        var note = await noteModel.findOneAndUpdate({ _id: params.noteID },
            {
                $pull: {
                    labelID: params.label_ID
                }
            })

        /**
         * @return {String}, message
         */
        if (!note) {
            return { "message": "label not deleted " }
        } else {
            for (let i = 0; i < (note.labelID).length; i++) {
                if (note.labelID[i] === params.label_ID) {
                    note.labelID.splice(i, 1);
                }
            }
            return { "message": "label delete from note successfully " }
        }


    } catch (error) {
        console.log("error in catch")
        return { "message": err }
    }
}

/**
 * @exports noteMutation
 */
module.exports = new noteMutation()