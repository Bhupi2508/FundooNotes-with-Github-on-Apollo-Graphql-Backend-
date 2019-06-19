/********************************************************************************************************************
 *  @Execution      : default node          : cmd> axios-services.js
 *                      
 * 
 *  @Purpose        : Axios services for send the data to server and take response 
 * 
 *  @description    : using apollo-graphql upload a pic in axios services for gitHub
 * 
 *  @overview       : fundoo application  
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 19-june-2019
 *
 *******************************************************************************************************************/
/**
 * @requires files
 */
const axios = require("axios")

/**
 * @exports axiosService
 * @param {String} url
 * @param {method} method
 */
exports.axiosService = (method, url, access_token, data) => {
    return new Promise((resolve, reject) => {
        var a = axios({
            method: method,
            url: url,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${access_token}`
            },
            data: data
        }
        )
            .then(function (res) {
                resolve(res)
            })
            .catch(function (err) {
                console.log("Error in axios service=>", err)
                reject(err)
            })
    })
}

