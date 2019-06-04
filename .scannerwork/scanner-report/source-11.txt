/******************************************************************************
 *  @Execution      : default node          : cmd> resolver.js
 * 
 *  @Purpose        : resolvers(Programs logic), imports all the queries and mutations the exports
 * 
 *  @description    : Inseide resolvers we write business logics and also fetch data
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
const redis = require("async-redis");
const client = redis.createClient()
const labelModel = require('../../model/labelSchema')  //labelModels  
const noteModel = require('../../model/noteSchema')   //noteModel
const colabModel = require('../../model/collabatorsSchema')   //colabModel
const user = require('../Query/query').user;   //user queries
const labelUser = require('../Query/query').labelUser   //labelUser queries
const notesUser = require('../Query/query').notesUser   //notesUser queries
const gitUser = require('../Query/query').gitUser    //gitUser queries
const colabUser = require('../Query/query').colabUser   //colabUser queries
const searchNoteByTitle = require('../Query/query').searchNoteByTitle   //searchNoteByTitle queries
const searchNoteByDescription = require('../Query/query').searchNoteByDescription   //searchNoteByDescription queries
const signUp = require('../Mutation/UserMutation').signup  //signUp mutation
const emailVerify = require('../Mutation/UserMutation').emailVerify  //emailVerify mutation
const login = require('../Mutation/UserMutation').login   //login mutation
const forgotPassword = require('../Mutation/UserMutation').forgotPassword   //forgotPassword mutation
const resetPassword = require('../Mutation/UserMutation').resetPassword   //resetPassword mutation
const update = require('../Mutation/UserMutation').update   //update mutation
const remove = require('../Mutation/UserMutation').remove   //remove mutation
const createLabel = require('../Mutation/labelMutation').createLabel   //createLabel mutation
const editLabel = require('../Mutation/labelMutation').editLabel  //editLabel mutation
const removeLabel = require('../Mutation/labelMutation').removeLabel   //removeLabel mutation
const createNote = require('../Mutation/noteMutation').createNote  //createNote mutation
const editNote = require('../Mutation/noteMutation').editNote  //editNote mutation
const removeNote = require('../Mutation/noteMutation').removeNote  //removeNote mutation
const Reminder = require('../Mutation/noteMutation').Reminder   //Reminder mutation
const deleteReminder = require('../Mutation/noteMutation').deleteReminder   //deleteReminder mutation
const Archieve = require('../Mutation/noteMutation').Archieve   //Archieve mutation
const ArchieveRemove = require('../Mutation/noteMutation').ArchieveRemove   //ArchieveRemove mutation
const Trash = require('../Mutation/noteMutation').Trash   //Trash mutation
const TrashRemove = require('../Mutation/noteMutation').TrashRemove   //TrashRemove mutation
const saveLabelToNote = require('../Mutation/noteMutation').saveLabelToNote  //saveLabelToNote mutation
const removeLabelFromNote = require('../Mutation/noteMutation').removeLabelFromNote  //removeLabelFromNote mutation
const GithubAuth = require('../Mutation/gitAuthMutation').GithubAuth    //GithubAuth mutation
const codeVerify = require('../Mutation/gitAuthMutation').codeVerify   //codeVerify mutation
const pullGitRepository = require('../Mutation/gitAuthMutation').pullGitRepository    //pullGitRepository mutation
const fetchRepository = require('../Mutation/gitAuthMutation').fetchRepository    //fetchRepository mutation
const starRepository = require('../Mutation/gitAuthMutation').starRepository    //starRepository mutation
const removeStarRepository = require('../Mutation/gitAuthMutation').removeStarRepository    //removeStarRepository mutation
const GitAuthTokenVerify = require('../Mutation/gitAuthMutation').GitAuthTokenVerify   //GitAuthTokenVerify mutation
const addWatchInGitRepo = require('../Mutation/gitAuthMutation').addWatchInGitRepo   //addWatchInGitRepo mutation
const deleteWatchInGitRepo = require('../Mutation/gitAuthMutation').deleteWatchInGitRepo   //deleteWatchInGitRepo mutation
const createGitBranch = require('../Mutation/gitAuthMutation').createGitBranch   //createBranch mutation
const deleteGitBranch = require('../Mutation/gitAuthMutation').deleteGitBranch   //deleteBranch mutation
const createGitRepository = require('../Mutation/gitAuthMutation').createGitRepository   //createGitRepository mutation
const removeGitRepository = require('../Mutation/gitAuthMutation').removeGitRepository   //removeGitRepository mutation
const picUpload = require('../Mutation/uploadPicMutation').picUpload   //picUpload mutation
const addCollaboration = require('../Mutation/collaboratorMutation').addCollaboration //picUpload mutation
const removeCollaboration = require('../Mutation/collaboratorMutation').removeCollaboration  //removeCollaboration mutation

//create a empty function
var userResolver = function () { }

/*******************************************************************************************************************/
/**
 * @param {Query}
 * @param {Mutation}
 * @param {User}
 * 
 */
userResolver.prototype.resolvers = {
    Query: {
        user,
        labelUser,
        notesUser,
        gitUser,
        colabUser,
        searchNoteByTitle,
        searchNoteByDescription
    },
    Mutation: {
        signUp,
        emailVerify,
        login,
        forgotPassword,
        resetPassword,
        update,
        remove,
        createLabel,
        editLabel,
        removeLabel,
        createNote,
        editNote,
        removeNote,
        Reminder,
        deleteReminder,
        Archieve,
        ArchieveRemove,
        Trash,
        TrashRemove,
        saveLabelToNote,
        removeLabelFromNote,
        GithubAuth,
        codeVerify,
        pullGitRepository,
        fetchRepository,
        starRepository,
        removeStarRepository,
        GitAuthTokenVerify,
        addWatchInGitRepo,
        deleteWatchInGitRepo,
        createGitBranch,
        deleteGitBranch,
        createGitRepository,
        removeGitRepository,
        picUpload,
        addCollaboration,
        removeCollaboration

    },
    User: {
        async labels(root, params, context) {
            var labels = await client.get('labels' + root._id)
            if (labels) {
                var value = JSON.parse(labels)
                return value
            }
            else {
                var labels_find = await labelModel.find({ userID: root._id })
                return labels_find
            }
        },

        async notes(root, params, context) {
            var regex1 = new RegExp(params.title)
            var regex2 = new RegExp(params.description)
            var notes = await noteModel.find({ userID: root._id, title: regex1, description: regex2 })
            return notes
        },

        async colabs(root, params, context) {
            var colabs = await colabModel.find()
            return colabs

        },
    }
}


/**
* @exports userResolver
*/
module.exports = new userResolver()