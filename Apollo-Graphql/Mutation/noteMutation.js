/********************************************************************************************************************
 *  @Execution      : default node          : cmd> noteMutation.js
 *                      
 * 
 *  @Purpose        : perform operations by using users
 * 
 *  @description    : By using mutation create a new files and fetch the data
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
var noteModel = require('../../model/noteSchema')
var labelModel = require('../../model/labelSchema')
var tokenVerify = require('../../Authentication/authenticationUser')
var logger = require('../../services/logger');
var { errorResponse } = require('../../services/errors');

//create a empty function
var noteMutation = function () { }



/******************************************************   createNote   *************************************************************/
/**
 * @description : create a APIs for add notes for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {*} root 
 * @param {*} params
 * @param {*} context
 */
noteMutation.prototype.createNote = async (root, params, context) => {
    try {
        var payload = tokenVerify.requireUser(context)


        /**
         * @param {String} title validation 
         * @param {String} description validation
         */
        if (params.title.length < 3) {
            return { "message": "Enter title length min 3 letter " }
        }
        if (!params.description || params.description.length < 4) {
            return { "message": "Enter description length min 4 letter " }
        }



        /**
         * @payload send token for verification
         * @condition if present or not
         * @returns {String} message
         */



        //find title from database
        var notefind = await noteModel.find({ title: params.title, userID: payload.userID })

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

        //save data in dataBase
        const note = await model.save()


        /**
         * @return {String}, message
         */
        if (!note) {
            return { "message": "note is not created" }
        } else {
            return { "message": "note created" }
        }


    } catch (err) {
        return errorResponse(err)
    }
}


/******************************************************   editNote   *************************************************************/
/**
 * @description : update data APIs for updated notes for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {token}
 * @purpose : update title or description from database
 * @param {params} params
 */
noteMutation.prototype.editNote = async (root, params, context) => {
    try {
        var payload = tokenVerify.requireUser(context)


        //find id from users models
        var note = await noteModel.findOneAndUpdate({ _id: params.noteID, userID: payload.userID },
            {
                $set: {
                    title: params.editTitle,
                    description: params.editDescription
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


    } catch (err) {
        return errorResponse(err)
    }
}


/********************************************************   removeNote   ***********************************************************/
/**
 * @description : remove APIs for remove note for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {*} root
 * @param {*} params
 */
noteMutation.prototype.removeNote = async (root, params, context) => {
    try {
        var payload = tokenVerify.requireUser(context)


        /**
         * @purpose : find id from database then remove from dataase
         * @param {String} id
         * @returns {String} message
         */
        var note = await noteModel.findOneAndRemove({ _id: params.noteID, userID: payload.userID })
        if (!note) {
            return { "message": "note is not present" }
        } else {
            return { "message": "note removed" }
        }


    } catch (err) {
        return errorResponse(err)
    }
}



/*********************************************************   saveLabelToNote   **********************************************************/
/**
 * @description : save label into notes APIs for updated notes for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {*} root
 * @param {*} params 
 */
noteMutation.prototype.saveLabelToNote = async (root, params, context) => {
    try {
        var payload = tokenVerify.requireUser(context)


        //find labelID from noteModel Schema
        var id = await noteModel.find({ _id: params.noteID, "labelID": params.label_ID })



        //if id is already present
        if (id.length > 0) {
            return { "message": "This label is already added in note" }
        }



        //find id from noteModel and update(push) into notes
        var note = await noteModel.findOneAndUpdate({ _id: params.noteID, userID: payload.userID },
            {
                $push: {
                    labelID: params.label_ID
                }
            })

        //condition
        if (!note) {
            return { "message": "label not added " }
        } else {
            return { "message": "label added on note successfully " }
        }


    } catch (err) {
        return errorResponse(err)
    }
}




/*******************************************************   removeLabelFromNote   **********************************************************/
/**
 * @description : save label into notes APIs for updated notes for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {*} root
 * @param {*} params
 */
noteMutation.prototype.removeLabelFromNote = async (root, params, context) => {
    try {
        var payload = tokenVerify.requireUser(context)


        //find labelID from noteModel Schema
        var id = await noteModel.find({ _id: params.noteID, userID: payload.userID, "labelID": params.label_ID })



        //if id is already present
        if (!id.length > 0) {
            return { "message": "This label is not present in notes" }
        }



        //find id from noteModel and update(push) into notes
        var note = await noteModel.findOneAndUpdate({ _id: params.noteID, userID: payload.userID },
            {
                $pull: {
                    labelID: params.label_ID
                }
            })

        //condition
        if (!note) {
            return { "message": "label not deleted " }
        } else {
            for (let i = 0; i < (note.labelID).length; i++) {
                if (note.labelID[i] === params.label_ID) {
                    note.labelID.splice(i, 1);
                }
            }

            //return the response
            return { "message": "label delete from note successfully " }
        }


    } catch (err) {
        return errorResponse(err)
    }
}





/******************************************************   Reminder   *************************************************************/
/**
 * @description : set Reminder APIs in notes for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 */
noteMutation.prototype.Reminder = async (root, params, context) => {
    try {
        var payload = tokenVerify.requireUser(context)


        //find noteID from noteModel Schema
        var id = await noteModel.find({ _id: params.noteID, userID: payload.userID })


        //if id is already present
        if (!id.length > 0) {
            return { "message": "This noteID is not present in notes" }
        }


        //set a date for reminder
        var date = new Date(params.reminder)
        logger.info(date)


        //find id from noteModel and update(push) into notes
        var note = await noteModel.findOneAndUpdate({ _id: params.noteID, userID: payload.userID },
            {
                $set: {
                    reminder: date
                }
            })

        //time set for reminder time


        /**
     * @return {String}, message
     */
        if (!note) {
            return { "message": "reminder not set " }
        }

        //return the response
        return { "message": "reminder set in note successfully" }


    } catch (err) {
        return errorResponse(err)
    }
}



/*******************************************************   deleteReminder   ************************************************************/
/**
 * @description : deleteReminder APIs from notes for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 */
noteMutation.prototype.deleteReminder = async (root, params, context) => {
    try {
        var payload = tokenVerify.requireUser(context)


        //find noteID from noteModel Schema
        var id = await noteModel.find({ _id: params.noteID, userID: payload.userID })

        //if id is already present
        if (!id.length > 0) {
            return { "message": "This noteID is not present in notes" }
        }



        //find id from noteModel and update(push) into notes
        var note = await noteModel.findOneAndUpdate({ _id: params.noteID, userID: payload.userID }, { $set: { reminder: "" } })
        logger.info(note)


        /**
         * @return {String}, message
         */
        if (!note) {
            return { "message": "reminder not remove " }
        }

        //return the response
        return { "message": "reminder remove successfully" }


    } catch (err) {
        return errorResponse(err)
    }
}


/******************************************************   Archieve   *************************************************************/
/**
 * @description : Archieve data APIs check whether is archieve or not for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {payload}, has token for verification and ID
 * @purpose : Archiev note from database
 * @param {params} params
 */
noteMutation.prototype.Archieve = async (root, params, context) => {
    try {
        var payload = tokenVerify.requireUser(context)


        /**
         * @payload send token for verification
         * @condition if present or not
         * @returns {String} message
         */



        //find that id id presen or not
        var checkNote = await noteModel.find({ _id: params.noteID, userID: payload.userID })
        logger.info(checkNote)


        //check whether is false or true in database
        if (!checkNote[0]) {
            return { "message": "note not found" }
        }
        if (checkNote[0].archieve == false) {

            /**
             * @purpose : find id and then update archieve
             * @param {ID}, userID
             * @returns {String}, message
             */
            await noteModel.updateOne({ _id: params.noteID, userID: payload.userID },
                {
                    $set:
                    {
                        "archieve": true
                    }
                })

            return { "message": "note Archieve" }
        }

        //return the response
        return { "message": "note already Archieve" }


    } catch (err) {
        return errorResponse(err)
    }
}





/*********************************************************   ArchieveRemove   **********************************************************/
/**
 * @description : Archieve data APIs check whether is archieve or not for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {payload}, has token for verification and ID
 * @purpose : Archiev note from database
 * @param {params} params
 */
noteMutation.prototype.ArchieveRemove = async (root, params, context) => {
    try {
        var payload = tokenVerify.requireUser(context)


        /**
         * @payload send token for verification
         * @condition if present or not
         * @returns {String} message
         */

        //find that id id presen or not
        var checkNote = await noteModel.find({ _id: params.noteID, userID: payload.userID })

        //check whether is false or true in database
        if (!checkNote[0]) {
            return { "message": "note not found" }
        }
        if (checkNote[0].archieve == false) {

            return { "message": "This note is not Archieve" }

        } else {

            /**
            * @purpose : find id and then update archieve
            * @param {ID}, userID
            * @returns {String}, message
            */
            await noteModel.updateOne({ _id: params.noteID, userID: payload.userID },
                {
                    $set:
                    {
                        "archieve": false
                    }
                })

            //return the response
            return { "message": "note remove from Archieve" }
        }


    } catch (err) {
        return errorResponse(err)
    }
}





/************************************************************     Trash      *******************************************************/
/**
 * @description : Trash data APIs check whether is Trash/Delete or not for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {payload}, has token for verification and ID
 * @purpose : Trash note from database
 * @param {params} params
 */
noteMutation.prototype.Trash = async (root, params, context) => {
    try {
        var payload = tokenVerify.requireUser(context)


        /**
         * @payload send token for verification
         * @condition if present or not
         * @returns {String} message
         */

        //find that id id presen or not
        var checkNote = await noteModel.find({ _id: params.noteID, userID: payload.userID })

        //check whether is false or true in database
        if (!checkNote[0]) {
            return { "message": "note not found" }
        }
        if (checkNote[0].trash == false) {


            /**
             * @purpose : find id and then update archieve
             * @param {ID}, userID
             * @returns {String}, message
             */
            await noteModel.updateOne({ _id: params.noteID, userID: payload.userID },
                {
                    $set:
                    {
                        "trash": true
                    }
                })

            return { "message": "note trash" }

        }

        //return the response
        return { "message": "This note is already in trash" }


    } catch (err) {
        return errorResponse(err)
    }
}






/*******************************************************   TrashRemove   ************************************************************/
/**
 * @description : Trash data APIs check whether is Trash/Delete or not for using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {payload}, has token for verification and ID
 * @purpose : Trash note from database
 * @param {params} params
 */
noteMutation.prototype.TrashRemove = async (root, params, context) => {
    try {
        var payload = tokenVerify.requireUser(context)


        /**
         * @payload send token for verification
         * @condition if present or not
         * @returns {String} message
         */



        //find that id id presen or not
        var checkNote = await noteModel.find({ _id: params.noteID, userID: payload.userID })



        //check whether is false or true in database
        if (!checkNote[0]) {
            return { "message": "note not found" }
        }
        if (checkNote[0].trash == false) {

            return { "message": "This not is not in trash" }

        } else {

            /**
            * @purpose : find id and then update archieve
            * @param {ID}, userID
            * @returns {String}, message
            */
            await noteModel.updateOne({ _id: params.noteID, userID: payload.userID },
                {
                    $set:
                    {
                        "trash": false
                    }
                })

            return { "message": "note remove from trash" }
        }


    } catch (err) {
        return errorResponse(err)
    }
}






/**
 * @exports noteMutation
 */
module.exports = new noteMutation()