import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import routes from '../constants/routes.json';
import Result from './Result'
import Setup  from './Setup'


const Image = (props) => {

    const [animation, setAnimation] = useState('')
  
    // Redux state
    const job = props.job
    const setJob = props.setJob
    const configuration  = props.configuration
    const pathListing = props.pathListing
    const setPathListing = props.setPathListing

    return (
        <div>
            <div data-tid="backButton">
                <Link to={routes.HOME}>
                    <i className="fa fa-arrow-left fa-3x" />
                </Link>
            </div>
            <Setup job={job} setJob={setJob}  setAnimation={setAnimation} configuration={configuration}
            pathListing={pathListing} setPathListing={setPathListing} ></Setup>        
            <Result job={job} animation={animation}></Result>
        </div>
    )
}


export default Image