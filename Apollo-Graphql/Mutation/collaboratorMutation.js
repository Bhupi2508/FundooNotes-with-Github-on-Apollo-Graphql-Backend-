/********************************************************************************************************************
 *  @Execution      : default node          : cmd> userMutations.js
 *                      
 * 
 *  @Purpose        : perform operations by using users
 * 
 *  @description    : By using mutation we can manipulate the data (CURD)
 * 
 *  @overview       : fundoo application  
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 27-april-2019
 *
 *******************************************************************************************************************/
/**
 * @requires files
 */
var redis = require('async-redis')
var bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
var userModel = require('../../model/userSchema')
var noteModel = require('../../model/noteSchema')
var sendMail = require('../../sendMailer/sendMail')
var colModel = require('../../model/collabatorsSchema');
var tokenVerify = require('../../Authentication/authenticationUser')

//create a redis client
var client = redis.createClient()

//saltrounds for hash password
var saltRounds = 10;

//create a empty function
var collaboratorMutation = function () { }


/*******************************************************************************************************************/
/**
 * @description : register APIs for register a new user using apollo-graphql
 * @purpose : register user in database
 * @param {root}, which has data information
 * @param {params}, input by users
 * @param {context}, req from queries, headers, server
 */
collaboratorMutation.prototype.addCollaboration = async (root, args, context) => {

    try {
        if (context.token) {
            var payload = await tokenVerify.verification(context.token)
            var user = await userModel.find({ "_id": payload.userID });
            if (!user) {
                return {
                    "message": "user not found"
                }
            }
            var note = await noteModel.find({ "_id": args.noteID })
            if (!note) {
                return {
                    "message": "note not found"
                }
            }
            var colab = await colModel.find({ "collaboratorID": args.colabID})
            console.log(colab);
            console.log(colab.length);
            
            if (colab.length>0) {
                return {
                    "message": "user already colabrated"
                }
            }
            var newColab = new colModel({
                "userID": payload.userID,
                "noteID": args.noteID,
                "collaboratorID": args.colabID
            })
            var save = newColab.save()
            if (save) {
                return {
                    "message": "colabbed successfully"
                }
            }
            else {
                return {
                    "message": "colab unsuccessful"
                }
            }

        }
        return {
            "message": "token not provided"
        }
    } catch (err) {
        console.log("!Error")
        return { "message": err }
    }
}


/**
 * @exports collaboratorMutation
 */
module.exports = new collaboratorMutation()