/********************************************************************************************************************
 *  @Execution      : default node          : cmd> test.js
 *                      
 * 
 *  @Purpose        : Mocha testing in apollo-graphql for test code
 * 
 *  @description    : test code with the help of mocha, chai, supertest
 * 
 *  @overview       : fundoo application  
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 30-april-2019
 *
 *******************************************************************************************************************/
/**
 * @requires files
 */
const { describe, it } = require('mocha')
const { expect } = require('chai')
const request = require('supertest')
var server = require('../server')

/**
 * @param {function()}
 */
describe('Apollo-GraphQL API', () => {

    /***************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */
    it('register API', done => {
        request('http://localhost:4000')
            .post('/graphql')

            //write your data for checking by giving mutation
            .send({ query: 'mutation { signUp (firstName:"akash" lastName:"sharma" email:"akaeddsh@gmail.com" password:"akasfdrgh1") {message}}' })
            .expect(200)
            .end((err, res) => {

                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success data
                expect(JSON.parse(res.text).data.signUp.message).to.deep.equal("Register successfull")
                done();
            });
    });

    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */
    it('login APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: 'mutation { login (email:"aaaaa@gmail.com" password:"akash1") {message}}' })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success
                expect(JSON.parse(res.text).data.login.message).to.deep.equal("email is not present")
                done();
            });
    });

    /***************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */
    it('forgotPassword APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: 'mutation { forgotPassword (email:"aaaaaaaa@gmail.com") {message}}' })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success
                expect(JSON.parse(res.text).data.forgotPassword.message).to.deep.equal("email is not present in database")
                done();
            });
    });

    /***************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */
    it('resetPassword APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: 'mutation{ resetPassword (newPassword:"123456789" confirmPassword:"123456789"){message}}' })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success
                expect(JSON.parse(res.text).data.resetPassword.message).to.deep.equal("resetPassword Successfully")
                done();

            });
    });

    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */

    it('addLabel APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: 'mutation {createLabel(labelName:"abcdefg"){message}}' })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success
                expect(JSON.parse(res.text).data.createLabel.message).to.deep.equal("Label created")
                done();

            });
    });


    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */

    it('editLabel APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: 'mutation {editLabel(labelID:"5cc6c5a32403fb4f1cac8d58" editlabelName:"AWS"){message}}' })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success
                expect(JSON.parse(res.text).data.editLabel.message).to.deep.equal("token is not verify")
                done();

            });
    });


    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */

    it('removeLabel APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: 'mutation {removeLabel(labelID:"5cc01661299f2121952ca652"){message}}' })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success
                expect(JSON.parse(res.text).data.removeLabel.message).to.deep.equal("label is already removed")
                done();

            });
    });


    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */

    it('addNote APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: 'mutation {createNote(title:"Javaaa", description:"programming languageaa"){message}}' })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success
                expect(JSON.parse(res.text).data.createNote.message).to.deep.equal("note created")
                done();

            });
    });


    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */

    it('editNote APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: 'mutation {editNote(noteID:"5cc01661299f2121952ca652" editTitle:"change name during tseting"){message}}' })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success
                expect(JSON.parse(res.text).data.editNote.message).to.deep.equal("note is not updated")
                done();

            });
    });


    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */

    it('removeNote APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: 'mutation {removeNote(noteID:"5cc016e0299f2121952ca653"){message}}' })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success 
                expect(JSON.parse(res.text).data.removeNote.message).to.deep.equal("note is not present")
                done();

            });
    });

    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */

    it('saveLabelToNote APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: 'mutation {saveLabelToNote(noteID:"5cc83713d3daa33afdc12605" labelID:"5cc6c5a32403fb4f1cac8d58"){message}}' })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success 
                expect(JSON.parse(res.text).data.saveLabelToNote.message).to.deep.equal("label added on note successfully ")
                done();

            });
    });

    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */

    it('removeLabelFromNote APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: 'mutation {removeLabelFromNote(noteID:"5cc004ca713f9c1141a20ac4" labelID:"5cc01661299f2121952ca652"){message}}' })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success 
                expect(JSON.parse(res.text).data.removeLabelFromNote.message).to.deep.equal("This label is not present in notes")
                done();

            });
    });

    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */

    it('social Git OAuth 2.0 APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: 'mutation {GithubAuth(email:"bhupendrasingh.ec18@gmail.com"){message}}' })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success 
                expect(JSON.parse(res.text).data.GithubAuth.message).to.deep.equal("Mail sent to your mail ID")
                done();

            });
    });

    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */

    it('codeVerify APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: 'mutation {codeVerify{message}}' })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success 
                expect(JSON.parse(res.text).data.codeVerify.message).to.deep.equal("Data save successfully")
                done();

            });
    });


    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */

    it('git Auth Token Verify for login APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: 'mutation {GitAuthTokenVerify{message}}' })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success 
                expect(JSON.parse(res.text).data.GitAuthTokenVerify.message).to.deep.equal("login & verification successfull")
                done();

            });
    });

});
