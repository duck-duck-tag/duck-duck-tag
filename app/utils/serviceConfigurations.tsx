
import { Path } from '../types'
import getFile from './getFile'

import getId from '../utils/getId'
import getUrlAsBase64 from '../utils/getUrlAsBase64'
import getSignatureKey from '../utils/getSignatureKey'
import imageId from '../reducers/assignId'

const crypto = require('crypto-js')
const sha256 = require('crypto-js/sha256')
const moment = require('moment')

class ServiceConfiguration {

    name: string
    API_URL_QUERY: string
    API_URL_BASE: string
    API_ENDPOINT: string
    API_INSTANCE: string
    API_KEY: string
    ACCESS_KEY_ID: string
    SECRET_ACCESS_KEY: string

    imgPath: Path

    constructor(configuration,path) {
        this.name = configuration.name

        // Store all options as properties of "this"
        // Options are referenced like this: THIS.API_KEY
        configuration.options.forEach(opt => {
            this[opt.name] = opt.value
         })

        
        this.imgPath = path
    }

    getName = () => {
        return this.name
    }

    getTimestamp = () => {
        return new Date().toISOString().split('T').join(' ') // Formatted to eg. "2020-08-10 14:30:45.399Z"
    }

}

class AzureConfig extends ServiceConfiguration {

    constructor(configuration,path) {
        super(configuration,path)
    }

    getHeaders = () => {
        return {
                'Ocp-Apim-Subscription-Key': this.API_KEY,
                'Content-Type': this.imgPath.type === 'url'  ?  'application/json' : 'application/octet-stream'
        }
    }

    getURL = () => {
        return this.API_ENDPOINT.concat(this.API_URL_QUERY);
    }

    getParams = () => {
        return {
        }
    }

    getBody = () => {
        if (this.imgPath.type === 'url') {
            return { "url": this.imgPath.path }
        }
        if (this.imgPath.type === 'localPath') {
            const file = getFile(this.imgPath.path)
            return file
        }
   
    }

    getHandleResponse = () => {

        const manipulateTag = (tag) => (
            {
                path: this.imgPath.path,
                type: this.imgPath.type,
                service: this.name,
                label: tag.name.toLowerCase(),
                accuracy: tag.confidence,
                id: getId(),
                time: this.getTimestamp()
            }
        )

        return (response) => {
            return response.data.tags.map(manipulateTag)
        }
    }

}

class IBMconfig extends ServiceConfiguration {

    constructor(configuration,path) {
        super(configuration,path)
    }

    getHeaders = () => {
        const apikey = btoa(`apikey:${this.API_KEY}`)

        return {
                'Authorization': `Basic ${apikey}`,
                'Content-Type': this.imgPath.type === 'url' ? 'application/json' : 'application/octet-stream' 
            
        }
    }

    getBody = () => {
            if (this.imgPath.type === 'localPath') {
                const file = getFile(this.imgPath.path)
                return file
            }

            if (this.imgPath.type === 'url') {
                return {}
            }
    }


    getParams = () => {
        if (this.imgPath.type === 'url') {
            return {
                url: this.imgPath.path,
                threshold: '0.0'
            }
        }

        if (this.imgPath.type === 'localPath') {
            return {
                threshold: '0.0'
            }
        }
    }


    getURL = () => {
        if (this.imgPath.type === 'url' || this.imgPath.type === 'localPath') {
            return (this.API_INSTANCE.match(/^http/) ? '' : this.API_URL_BASE) + this.API_INSTANCE + this.API_URL_QUERY
        }
    }

    getHandleResponse = () => {

        const manipulateTag = (tag) => (
            {
                path: this.imgPath.path,
                type: this.imgPath.type,
                service: this.name,
                label: tag.class.toLowerCase(),
                accuracy: tag.score,
                id: getId(),
                time: this.getTimestamp()
            }
        )
        

        return (response) => {
        
            return response.data.images.find(obj => Object.keys(obj).includes('classifiers') ).classifiers[0].classes.map(manipulateTag)
            
        }
    }

}

class AWSconfig extends ServiceConfiguration {

    constructor(configuration,path) {
        super(configuration,path)
    }

    getHeaders = () => {

        const requestPayload = JSON.stringify(this.getBody())

        const date = moment.utc().format("YYYYMMDD")
        const amzdate = moment.utc().format("YYYYMMDDTHHmmss") + 'Z'

        const contenttype = 'application/x-amz-json-1.1'

        const region = 'us-east-1'  // at some point switch to eu-west-1
        const host = 'rekognition.' + region + '.amazonaws.com'
        const credentialScope = date + '/' + region + '/rekognition/aws4_request'
        
        const signedHeaders = 'content-type;host;x-amz-date'
        const algorithm = 'AWS4-HMAC-SHA256'

        const canonicalRequest = 
            'POST\n' +
            '/\n' +
            '\n' +
            'content-type:' + contenttype + '\n' + 
            'host:' + host + '\n' + 
            'x-amz-date:' + amzdate + '\n\n' +
            signedHeaders + '\n' + 
            sha256(requestPayload).toString()

        const string_to_sign = 
            algorithm + '\n' +
            amzdate + '\n' +
            credentialScope + '\n' +
            sha256(canonicalRequest).toString()

        const signingKey = getSignatureKey(
            this.SECRET_ACCESS_KEY,
            date,
            region,
            "rekognition"
        )

        const signature = crypto.HmacSHA256(string_to_sign, signingKey).toString()

        const auth = `${algorithm} Credential=` + this.ACCESS_KEY_ID + `/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
        
        // console.log("authimme", auth)

        return {
            'Authorization': auth,
            'Content-Type': contenttype,
            'host': host,
            'x-amz-date': amzdate,
            'x-amz-target': 'RekognitionService.DetectLabels'
        }

    }

    getBody = () => {

        if (this.imgPath.type === 'localPath') {
            const image = Buffer.from(getFile(this.imgPath.path), 'binary').toString('base64')

            return {
                Image: {
                    Bytes: image
                },
                MinConfidence: 0.0
            }
        }

        // getUrlAsBase64(this.imgPath.path).then(image => {

        //     return {
        //         Image: {
        //             Bytes: image
        //         },
        //         MinConfidence: 0.0
        //     }
        // })

    }


    getParams = () => {
        return {

        }
    }


    getURL = () => {
        return 'https://rekognition.us-east-1.amazonaws.com'
    }

    getHandleResponse = () => {

        const manipulateTag = (tag) => {            
            return {
                path: this.imgPath.path,
                type: this.imgPath.type,
                service: this.name,
                label: tag.Name.toLowerCase(),
                accuracy: tag.Confidence/100,
                id: getId(),
                time: this.getTimestamp()
            }
        }
        

        return (response) => {
            return response.data.Labels.map(manipulateTag)            
        }
    }
}

export const createQuery = (config,path) => {

    let query

    if (config.name === 'Azure') {
        query = new AzureConfig( config, path )
    }

    if (config.name === 'IBM') {
        query = new IBMconfig( config, path )
    }

    if (config.name === 'AWS') {
        query = new AWSconfig( config, path )
    }

    return query
} 



export default createQuery

