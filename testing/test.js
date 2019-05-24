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
var fs = require('fs')
var access_token = "";
var signUp_token = "";
var forgotPassword_token = "";
var git_token = "";


/**
 * @function testJSON
 */
function testJSON() {

    var data = fs.readFileSync('/home/admin1/Desktop/fundoo(apollo)/testing/testFile.json');
    var data1 = JSON.parse(data);
    return data1;
}




/*********************************************************    Users   *********************************************************************/
/**
 * @param {function()}
 */
describe('Apollo-GraphQL Users API', () => {

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
            .send({ query: testJSON().signUp })
            .expect(200)
            .end((err, res) => {

                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success data
                expect(JSON.parse(res.text).data.signUp.message).to.deep.equal("Register successfull")
                signUp_token = JSON.parse(res.text).data.signUp.token
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
            .send({ query: testJSON().login })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success
                expect(JSON.parse(res.text).data.login.message).to.deep.equal("!Login....Successfully")
                access_token = JSON.parse(res.text).data.login.token
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
            .query({ 'token': signUp_token })
            .send({ query: testJSON().forgotPassword })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success
                expect(JSON.parse(res.text).data.forgotPassword.message).to.deep.equal("email is not present in database")
                forgotPassword_token = JSON.parse(res.text).data.forgotPassword.token
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
            .query({ 'token': forgotPassword_token })
            .send({ query: testJSON().resetPassword })
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
})




/*********************************************************    Labels   ********************************************************************/
/**
 * @param {function()}
*/
describe('Apollo-GraphQL Labels API', () => {

    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */

    it('createLabel APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .query({ 'token': access_token })
            .send({ query: testJSON().createLabel })
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
            .query({ 'token': access_token })
            .send({ query: testJSON().editLabel })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success
                expect(JSON.parse(res.text).data.editLabel.message).to.deep.equal("Label updated")
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
            .query({ 'token': access_token })
            .send({ query: testJSON().removeLabel })
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
})




/**********************************************************    Notes   ********************************************************************/
/**
* @param {function()}
*/
describe('Apollo-GraphQL Notes API', () => {


    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */

    it('createNote APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .query({ 'token': access_token })
            .send({ query: testJSON().createNote })
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
            .query({ 'token': access_token })
            .send({ query: testJSON().editNote })
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
            .query({ 'token': access_token })
            .send({ query: testJSON().removeNote })
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

    it('Reminder APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: testJSON().Reminder })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success 
                expect(JSON.parse(res.text).data.GitAuthTokenVerify.message).to.deep.equal("reminder set in note successfully")
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

    it('Reminder delete APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .send({ query: testJSON().deleteReminder })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success 
                expect(JSON.parse(res.text).data.GitAuthTokenVerify.message).to.deep.equal("reminder remove successfully")
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

    it('Archieve APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .query({ 'token': access_token })
            .send({ query: testJSON().Archieve })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success 
                expect(JSON.parse(res.text).data.GitAuthTokenVerify.message).to.deep.equal("note Archieve")
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

    it('ArchieveRemove APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .query({ 'token': access_token })
            .send({ query: testJSON().ArchieveRemove })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success 
                expect(JSON.parse(res.text).data.GitAuthTokenVerify.message).to.deep.equal("note remove from Archieve")
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
            .query({ 'token': access_token })
            .send({ query: testJSON().saveLabelToNote })
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
            .query({ 'token': access_token })
            .send({ query: testJSON().removeLabelFromNote })
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

    it('addCollaborator APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .query({ 'token': access_token })
            .send({ query: testJSON().addCollaboration })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success 
                expect(JSON.parse(res.text).data.removeLabelFromNote.message).to.deep.equal("colabbed successfully")
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

    it('removeCollaborators APIs', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .query({ 'token': access_token })
            .send({ query: testJSON().removeCollaboration })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success 
                expect(JSON.parse(res.text).data.removeLabelFromNote.message).to.deep.equal("collaborator removed successfully")
                done();

            });
    });
})







/********************************************************    GithubAith   ****************************************************************/
/**
* @param {function()}
*/
describe('Apollo-GraphQL GithubAith API', () => {


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
            .send({ query: testJSON().GithubAuth })
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
            .query({ 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI1Y2Q0MDY1MDI1ZDA4ZjNjODg0MjUzOTUiLCJpZCI6NDc2Mzk2MzYsImxvZ2luIjoiQmh1cGkyNTA4IiwiaWF0IjoxNTU3Mzk5MTIwLCJleHAiOjE2NDM3OTkxMjB9.nidKhPCHXubIosxpueDGynYMMv5qtpd5oDCHKediXo8' })
            .send({ query: testJSON().codeVerify })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success 
                expect(JSON.parse(res.text).data.codeVerify.message).to.deep.equal("Data save successfully")
                git_token = JSON.parse(res.text).data.codeVerify.token
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

    it('GitAuthTokenVerify for git login verification', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .query({ 'token': git_token })
            .send({ query: testJSON().GitAuthTokenVerify })
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



    /****************************************************************************************************************/
    /**
    * @purpose : Testing for users APIs
    * @property {request} request has do request for server
    * @property {post} post has post the function to the given path
    * @property {send} send has send the parameter to the mutation
    * @property {expect} expect has pass the ok means all are fine
    * @returns {error} error
    */

    it('Repository fetching', done => {
        request('http://localhost:4000')
            .post('/graphql ')

            //write your data for checking by giving mutation
            .query({ 'token': git_token })
            .send({ query: testJSON().pullGitRepository })
            .expect(200)
            .end((err, res) => {


                //if any error the return error
                if (err) {
                    return done(err);
                }

                //otherwise return success 
                expect(JSON.parse(res.text).data.GitAuthTokenVerify.message).to.deep.equal("git  repository fetch Successfully")
                done();

            });
    });

});
