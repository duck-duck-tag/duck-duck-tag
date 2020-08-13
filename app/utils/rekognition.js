const fs    = require('fs')
const axios = require('axios')
const crypto = require('crypto-js')
const sha256 = require('crypto-js/sha256')
const moment = require('moment')


const postaa = () => {

    getSignatureKey = (key, dateStamp, regionName, serviceName) => { //dateStamp format YYYYMMDD
        var kDate = crypto.HmacSHA256(dateStamp, "AWS4" + key);
        var kRegion = crypto.HmacSHA256(regionName, kDate);
        var kService = crypto.HmacSHA256(serviceName, kRegion);
        var kSigning = crypto.HmacSHA256("aws4_request", kService);
        return kSigning;
    }


    const getFile = (path) => {
        return Buffer.from(fs.readFileSync(path), 'binary').toString('base64')
    }


    const getUrlAsBase64 = (url) => {
        return axios.get(url, {
            responseType: 'arraybuffer'
        })
        .then(response =>  Buffer.from(response.data, 'binary').toString('base64'))
    }


    // lokaali kuva:
    //const image = getFile('fruitbowl.jpg')


    // url:
    const getBody = getUrlAsBase64("https://watson-developer-cloud.github.io/doc-tutorial-downloads/visual-recognition/fruitbowl.jpg")

    Promise.resolve(getBody)
        .then(image => {

        const date = moment().format("YYYYMMDD")
        const amzdate = moment().format("YYYYMMDDTHHmmssZ")

        // console.log("date", date, typeof(date))
        // console.log("date", amzdate, typeof(amzdate))


        const region = 'us-east-1'  // at some point switch to eu-west-1
        const signedHeaders = 'content-type;host;x-amz-date;x-amz-target' // headers to use for the signature
        const credentialScope = date + '/' + region + '/rekognition/aws4_request'
        const algorithm = 'AWS4-HMAC-SHA256'
    

        // substitute with actual credentials
        const access_key_ID = ""
        const secret_access_key = ""
        

        const URL = 'https://rekognition.' + region + '.amazonaws.com'
        const contenttype = 'application/x-amz-json-1.1'

        //const URL = 'http://localhost:3001/pretendAPI/'  // to try with the mock server, also change the content-type
        //const contenttype = 'application/json'


        const host = 'rekognition.' + region + '.amazonaws.com'
        //const host = 'rekognition.amazonaws.com'
        

        const body = {
            Image: {
                Bytes: image
            }
        }


        const requestPayload = JSON.stringify(body) // from body ?

        // console.log("payloadimme", body) // probably not this
        // console.log("payloadimme", body.toString()) // not this
        // console.log("payloadimme", JSON.stringify(body)) // maybe correct


        // Constructing a HTTP request following these instructions (4 tasks): https://docs.aws.amazon.com/general/latest/gr/sigv4_signing.html


        // 1. Task: create a canonical request: https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html
        const canonicalRequest = 
            'POST\n' +
            URL + '\n' +
            'Action=rekognition:DetectLabels\n' +
            'content-type:' + contenttype + '\n' + 
            'host:' + host + '\n' + 
            'x-amz-date:' + amzdate + '\n' + 
            'x-amz-target:RekognitionService.DetectLabels\n\n' + // important to have two times \n here
            signedHeaders + '\n' + 
            sha256(requestPayload).toString() // already base-16 lowercase
        
        // console.log("canonical requestimme\n", canonicalRequest)


        // const examplePayload = ''

        // console.log("example payload", sha256(examplePayload).toString() === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')

        // const examplecanon = 
        // 'GET\n' + 
        // '/\n' +
        // 'Action=ListUsers&Version=2010-05-08\n' +
        // 'content-type:application/x-www-form-urlencoded; charset=utf-8\n' +
        // 'host:iam.amazonaws.com\n' +
        // 'x-amz-date:20150830T123600Z\n\n' +
        // 'content-type;host;x-amz-date\n' +
        // 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        
        // console.log("hashed example request", sha256(examplecanon).toString() === 'f536975d06c0309214f805bb90ccff089219ecd68b2577efef23edd43b7e1a59')


        // 2. Task: create a string to sign: https://docs.aws.amazon.com/general/latest/gr/sigv4-create-string-to-sign.html

        const string_to_sign = 
            algorithm + '\n' +
            amzdate + '\n' +
            credentialScope + '\n' +
            sha256(canonicalRequest).toString() // already base-16 lowercase

        // console.log("hashed canonical request", sha256(canonicalRequest).toString())
        // console.log("string to sign\n", string_to_sign)


        // 3. Task: calculate the signature: https://docs.aws.amazon.com/general/latest/gr/sigv4-calculate-signature.html
        const signingKey = getSignatureKey(
            secret_access_key,
            date,
            region,
            "rekognition"
        )

        //console.log("avaimemme", signingKey.toString())


        // const examplestringtosign = 
        // 'AWS4-HMAC-SHA256\n' +
        // '20150830T123600Z\n' +
        // '20150830/us-east-1/iam/aws4_request\n' +
        // 'f536975d06c0309214f805bb90ccff089219ecd68b2577efef23edd43b7e1a59'

        // const examplekey = getSignatureKey(
        //     'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
        //     '20150830',
        //     'us-east-1',
        //     'iam'
        // ) // NO toString()


        // console.log("example string to sign\n", examplestringtosign)
        // console.log("examplekeymme", examplekey, examplekey.toString(), examplekey.toString() === 'c4afb1cc5771d871763a393e44b703571b55cc28424d1a5e86da6ed3c154a4b9')


        const signature = crypto.HmacSHA256(string_to_sign, signingKey).toString()

        console.log("allekirjoituksemme", signature)
        

        // const examplesignature = crypto.HmacSHA256(examplestringtosign, examplekey).toString() //examplekey as word array, NOT AS STRING !
        // console.log("esimerkkiallekirjoituksemme", 
        //     examplesignature, examplesignature === '5d672d79c15b13162d9279b0855cfba6789a8edb4c82c400e06b5924a6f2b5d7')


        // 4. Task: construct HTTP request: https://docs.aws.amazon.com/general/latest/gr/sigv4-add-signature-to-request.html

        const auth = `${algorithm} Credential=${access_key_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

        console.log("authimme", auth)
        
        const headers = {
            'Authorization': auth,
            'Content-Type': contenttype,
            'host': host,
            'x-amz-date': amzdate,
            'x-amz-target': 'RekognitionService.DetectLabels' // should be included in signed headers ??
        }

        return axios.post(URL, body, { headers: headers } )
                    .then(resp => {

                        console.log('koko response', resp)

                        console.log('responsemme',resp.status)

                        return true
                    })
                    .catch(err => {
                        
                        console.log('Error tagging images:',err)
                    })
    })
}


postaa()

