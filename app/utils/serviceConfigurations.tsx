
import axios from 'axios'
import { Path } from '../types'
import getFile from './getFile'

import getId from '../utils/getId'

class ServiceConfiguration {

    name: string
    API_URL_QUERY: string
    API_URL_BASE: string
    API_ENDPOINT: string
    API_INSTANCE: string
    API_KEY: string

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
                id: getId()
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
                id: getId()
            }
        )
        

        return (response) => {
        
            return response.data.images.find(obj => Object.keys(obj).includes('classifiers') ).classifiers[0].classes.map(manipulateTag)
            
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

    return query
} 



export default createQuery

