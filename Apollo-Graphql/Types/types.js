/******************************************************************************
 *  @Execution      : default node          : cmd> types.js
 * 
 *  @Purpose        : apollo-graphql Schema for all users
 * 
 *  @description    : types has apollo-graphql schema which we used to fetch data for
 *                    users or do some CURD operation for manipulate data.
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
const { gql } = require('apollo-server');

/**
 * @type {User}
 * @type {Label}
 * @type {Notes}
 * @type {Github}
 * @type {UploadPic}
 * @type {Query}
 * @type {MutationRecord}
 */
const typeDefs = gql`
type User {
    _id : ID!
    firstName : String!
    lastName : String!
    email : String!
    password : String!
    message : String!
    token : String
    labels : [Label]
    notes : [Notes]
 }

 type Label {
     _id : ID!
     userID: ID!
     labelName : String!
     message : String!
   }

   type Notes {
     _id: ID!
     title: String!
     description: String!
     reminder: String!
     color: String!
     img: String!
     archieve: Boolean!
     trash: Boolean!
     pin: Boolean!
     message: String!
     loginName: String!,
     gitID:  String!,
     access_Token: String!
   }
   
   type repo {
       name : String!
       description : String
   }

   type GitHub {
      _id: ID!
      loginName: String!
      gitID: String!
      access_Token: String!
      message: String!
      token : String
      clientMutationId : String
      repo:[repo]
   }

   type UploadPic {
      uploadURL: String!
      Key: String!
   }

 type Query {
    user(userID:String, first: Int, offset: Int): [User]
    labelUser(userID:String, first: Int, offset: Int): [Label]
    notesUser(userID:String, first: Int, offset: Int): [Notes]
    gitUser: [GitHub]
    PicUser: [UploadPic]
    gitHubRepository: [User]
 }

 
 type Mutation{
    signUp(firstName: String!,lastName: String!,email: String!, password: String!):User
    emailVerify:User
    login(email: String!, password: String!):User
    forgotPassword(email: String!):User
    resetPassword(newPassword: String!, confirmPassword: String!):User
    update(firstName: String!):User
    remove(id: String!):User
    createLabel(labelName: String!):Label
    editLabel(labelID: ID!, editlabelName: String!):Label
    removeLabel(labelID: String!):Label
    createNote(title: String!, description: String!, reminder: String, color: String, img: String):Notes
    editNote(noteID: ID!, editTitle: String, editDescription: String):Notes
    removeNote(noteID: ID!):Notes
    Reminder(noteID: ID!, reminder: String!):Notes
    deleteReminder(noteID: ID!):Notes
    Archieve(noteID: ID!):Notes
    ArchieveRemove(noteID: ID!):Notes
    Trash(noteID: ID!):Notes
    TrashRemove(noteID: ID!):Notes
    saveLabelToNote(noteID: ID!, label_ID: ID!): Notes
    removeLabelFromNote(noteID: ID!, label_ID: ID!): Notes
    GithubAuth(email: String!): GitHub
    codeVerify(firstName: String, lastName: String, email: String): GitHub
    pullGitRepository:GitHub
    fetchRepository:GitHub
    starRepository:GitHub
    removeStarRepository:GitHub
    GitAuthTokenVerify: GitHub
    addWatchInGitRepo(gitUsername: String!, repoName: String!): GitHub
    deleteWatchInGitRepo(gitUsername: String!, repoName: String!): GitHub
    createGitBranch(newBranch: String!, gitUsername: String!, repoName: String!): GitHub
    deleteGitBranch(DeleteBranch: String!, gitUsername: String!, repoName: String!): GitHub
    picUpload: UploadPic
    addCollaboration(noteID:String!,colabID:String!):User

 }`;


/**
 * @exports typeDefs
 */
module.exports = { typeDefs };
