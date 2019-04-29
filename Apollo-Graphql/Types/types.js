/******************************************************************************
 *  @Execution      : default node          : cmd> types.js
 * 
 *  @Purpose        : Generate a resolver for typeDefs for users
 * 
 *  @description    : GraphQL query for specific fields on object and result will come exactly 
 *                    the same shape as request.
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

const typeDefs = gql`
type User {
    _id : ID!
    firstName : String!
    lastName : String!
    email : String!
    password : String!
    message : String!
    token : String!
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

   type GitHub {
      _id: ID!
      loginName: String!
      gitID: String!
      access_Token: String!
      message: String!
   }

   type UploadPic {
      uploadURL: String!
      Key: String!
   }

 type Query {
    user(userID:String): [User]
    labelUser(userID:String): [Label]
    notesUser(userID:String): [Notes]
    gitUser: [GitHub]
    PicUser: [UploadPic]

 }
 
 type Mutation{
    signUp(firstName: String!,lastName: String!,email: String!, password: String!):User
    emailVerify:User
    login(email: String!, password: String!):User
    forgotPassword(email: String!):User
    resetPassword(newPassword: String!, confirmPassword: String!):User
    createLabel(labelName: String!):Label
    editLabel(labelID: ID!, editlabelName: String!):Label
    removeLabel(labelID: String!):Label
    createNote(title: String!, description: String!, reminder: String, color: String, img: String):Notes
    editNote(noteID: ID!, editTitle: String!):Notes
    removeNote(noteID: ID!):Notes
    saveLabelToNote(noteID: ID!, label_ID: ID!): Notes
    removeLabelFromNote(noteID: ID!, label_ID: ID!): Notes
    GithubAuth(email: String!): GitHub
    codeVerify: GitHub
    GitAuthTokenVerify: GitHub
    picUpload: UploadPic

 }`;


//exports typeDefs function
module.exports = { typeDefs };
