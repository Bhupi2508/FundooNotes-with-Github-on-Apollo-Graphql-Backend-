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
 type label {
     labelname : String!
 }
 type Query {
    user : [User]
    userLabel : [label]  

 }
 
 type Mutation{
    signUp(firstName: String!,lastName: String!,email: String!, password: String!):User
    emailVerify:User
    login(email: String!, password: String!):User
    forgotPassword(email: String!):User
    resetPassword(newPassword: String!, confirmPassword: String!):User
    createLabel(labelName: String!):label
    editLabel(labelID: ID!,editlabelName: String!):label
    removeLabel:label
 }
`;


//exports typeDefs function
module.exports = { typeDefs };
