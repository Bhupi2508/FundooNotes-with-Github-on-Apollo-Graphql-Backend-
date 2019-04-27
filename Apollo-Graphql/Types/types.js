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

module.exports = { typeDefs };
