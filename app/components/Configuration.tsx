import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import services from '../constants/services.json';
import styles from './Configuration.css';

type Props = {
    addConfiguration: (object) => void;
}


const Configuration = ( props: Props ) => {

    const [SERVICE, setSERVICE] = useState('')

    useEffect(() => {

        const defaultService = services[0].name
        setSERVICE(defaultService)
        
    },[])

    if (!services) {
        return ''
    }




    const addConfiguration = props.addConfiguration

    const configuration = props.configuration[SERVICE]
  
   

    const handleConfigChange = (e,which) => {

        let alteredConfig = { ...configuration }

        alteredConfig.options = alteredConfig.options.map( opt => {
            opt.value = opt.name === which.name ?  e.target.value : opt.value
            return opt
        })
        

        addConfiguration(alteredConfig)
    }

  
    const displaySecret = (secret) => {
        if (secret) {
            return secret.replace(/./g,'*') 
        }
        return ''
    }

    return(
        <div>
            
            <Link to={routes.HOME}>
                <i className="fa fa-arrow-left fa-3x" />
            </Link>
            <br></br>
            {
                services.map(service => {

                    const style = service.name === SERVICE ? styles.chosenButton :  styles.button

                    return <button key={service.name} className={style}  onClick={() => setSERVICE(service.name)}>{ service.name }</button>
                })
            }
            {

                configuration ?  configuration.options.map(opt => {

                        return (
                            <div key={SERVICE+opt.name}>
                                  <h5>{opt.displayName}</h5>
                                <input placeholder={opt.displayName}  onChange={(e) => handleConfigChange(e,opt)} type='text' ></input>
                            </div>
                        )

                    }) : ''
            }
            <div>
                Current config for {SERVICE}:
                <ul>
                    {
                        configuration  ? configuration.options.map(opt => {
                            return(
                                <li key={SERVICE+opt.name}>
                                    {opt.displayName}: { opt.secret ? displaySecret(opt.value) : opt.value }
                                </li>
                            )


                        }) : ''
                    }
                </ul>
            </div>
        </div>
           
    )
}

export default Configuration