import React, { useState, useEffect } from 'react'
import getId from '../utils/getId'
import getPathsFromTxt from '../utils/getPathsFromTxt'
import Listing from './Listing'
import styles from './Image.css';
import { Tag } from '../types'
import services from '../constants/services.json'
import createQuery from '../utils/serviceConfigurations'
import downloadImage from '../utils/downloadImage'
import zipFiles from '../utils/zipFiles'
import tagImage from '../utils/tagImage';
import { remote } from 'electron'



const Setup = (props) => {

    const setAnimation = props.setAnimation
    const animation   = props.animation
    const job = props.job
    const setJob = props.setJob
    const pathListing = props.pathListing
    const setPathListing = props.setPathListing

    const [servicesToSend, setServicesToSend] = useState([])
    const [imageURL, setImageURL] = useState('https://picsum.photos/id/256/200/200.jpg')
    const [showDeleteAllChoice, setShowDeleteAllChoice] = useState(false)

    useEffect(() => {
        setServicesToSend( services.map(service => service.name) )
    }, [])

    const handleJobChange = (servicesInJob, result) => {
        
        const newJob = {
            sessionJobID: job.sessionJobID + 1,
            services: servicesInJob,
            result: result
        }
        
        setJob(newJob)

        return newJob
    }

    const sendImages = () => {

        const animationText = 'sending images for analysis'

        setAnimation( animation.concat(animationText) )
        // Construct queries from configurations of selected services
        const queriesBasedOnConf = servicesToSend
            .map(service => props.configuration[service])
            .map(configuration => pathListing
                .filter(path => path.selected)
                .map(path => createQuery(configuration, path)))
            .flat()

        const promises = queriesBasedOnConf.map(q => tagImage(q))
        
        Promise.all(promises).then((values: Array<Tag>) => {
            const result = values.flat() // values is a nested array: each service is it's own array
            setAnimation( animation.filter(a => a !== animationText) )
            console.log(result)
            const sortedResult = result.sort((result1, result2) => (result1.accuracy > result2.accuracy) ? -1 : 1)
            return handleJobChange(servicesToSend, sortedResult)
        }).then(job => {
            
            const animationText = 'downloading images'
            setAnimation( animation.concat(animationText) )

            const files = []

            const downloads = pathListing.filter(path => path.type==='url').map(path => {

                let imagefilename = path.path.match(/\/[^/]+$/)

                if (!imagefilename) {
                    console.log('what is the filename of image?')
                }
            
                imagefilename = `./downloaded-images/${job.sessionJobID}_${imagefilename[0].replace('/','')}`
            
                files.push(imagefilename)
                return downloadImage(path.path, imagefilename)
            })

            Promise.all(downloads).then(d => {
               setAnimation( animation.filter(a => a !== animationText) )
               zipFiles(files,job.sessionJobID,'./downloaded-images')
            })

        })

        
    }

    const handleAnalyzeClick = () => {
        const serviceArray = servicesToSend

        if (serviceArray.length < 1) {
            alert("Add at least one service")

        } else if (pathListing.filter(path => path.selected).length < 1) {
            alert("Add at least one image")
        } else {
            if (window.confirm(`You are sending ${pathListing.filter(path => path.selected).length} images to${serviceArray}`)) {

                sendImages()
            }
        }
    }

    const handleURLchange = (e: Event) => {
        setImageURL(e.target.value)
    }

    const handleClickURL = () => {
        setPathListing(pathListing.concat({ type: 'url', path: imageURL, selected: true, id: getId() }))
        setImageURL('')
    }

    const handleClickURLsFromFile = () => {
        remote.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'Text', extensions: ['txt'] },
            ]
        }).then(result => {
            const paths = getPathsFromTxt(result.filePaths[0]).map(url => {
                return { type: 'url', path: url, selected: true, id: getId() }
            })
            setPathListing(pathListing.concat(paths))
        }).catch(err => {
            console.log(err)
        })
    }

    const handleClickLocal = () => {
        remote.dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
            ]
        }).then(result => {
            const paths = result.filePaths.map(filePath => {
                return { type: 'localPath', path: filePath, selected: true, id: getId() }
            })
            setPathListing(pathListing.concat(paths))
        }).catch(err => {
            console.log(err)
        })
    }

    const handleSelection = (name: string) => {

        const changedServiceSet = servicesToSend.includes(name) ? servicesToSend.filter(s => s !== name) : servicesToSend.concat(name)

        setServicesToSend( changedServiceSet )
    }

    const handleImageSelection = (path: string) => {
        const changedOneSelection = pathListing.map(p => p.path === path ? {...p, selected: !p.selected} : p)
        setPathListing(changedOneSelection)
    }

    const handleImageSelectionAll = (selectionValue : boolean) => {
        const selectedImages = pathListing.map(p => ({ ...p, selected: selectionValue }))
        setPathListing(selectedImages)
    }
   
    const handleDelete = (path: string) => {
        const deletedOneListing = pathListing.filter(p => p.path !== path)
        setPathListing(deletedOneListing)
    }

    const handleDeleteAll = () => {
        setShowDeleteAllChoice(true)
    }

    const pathListingToEmpty = () => {
        setPathListing([])
        setShowDeleteAllChoice(false)
    }

    const handleClose = () => setShowDeleteAllChoice(false)

    return (
        <div>
            <Listing pathListing={pathListing} handleDelete={handleDelete} 
                handleDeleteAll={handleDeleteAll} handleImageSelectionAll={handleImageSelectionAll} 
                handleImageSelection={handleImageSelection} handleClose={handleClose} 
                showDeleteAllChoice={showDeleteAllChoice} pathListingToEmpty={pathListingToEmpty}></Listing>
            
            <h5>URL for image to tag:</h5>
            <input value={imageURL} onChange={handleURLchange} type='text' ></input>
            <button className={styles.button} id="url" onClick={handleClickURL}>Add image URL</button>
            <button className={styles.button} id="url" onClick={handleClickURLsFromFile}>Add URLs from file</button>
            <button className={styles.button} id="url" onClick={handleClickLocal}>Add local images</button>
            <br></br>
            <div>
                <form>
                    {
                        services.map(service => {
                            return (
                                <div key={service.name}>
                                    <label >{service.name}</label>
                                    <input className='isSelected' checked={servicesToSend.includes(service.name)}  type='checkbox' onChange={() => handleSelection(service.name)} />
                                </div>
                            )
                        })
                    }
                </form>
            </div>
            <button className={styles.button} id="analyze-button" onClick={handleAnalyzeClick}>Analyze images</button>
        </div>
    )
}

export default Setup