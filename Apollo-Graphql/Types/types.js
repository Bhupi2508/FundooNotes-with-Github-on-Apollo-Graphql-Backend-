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
    user :[User]  

 }
 
 type Mutation{
    signUp(firstName: String!,lastName: String!,email: String!, password: String!):User
    emailVerify:User
 }
`;


//exports typeDefs function
module.exports = { typeDefs };
