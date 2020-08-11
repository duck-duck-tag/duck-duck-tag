import React from 'react'
import Analysis from './Analysis'
import Export from './Export'
import Results from './Results'
import WordCloud from './WordCloud'


const Result = ({ job, animation }) => {


    return(
        <div>
            <br></br>
            <br></br>
            <Export job={job}></Export>
            <br></br>
            <div>
                {animation}
            </div>
            <Results job={job} />
            <br></br>
            <br></br>
            <Analysis job={job} animation={animation} />
            <br></br>
            <br></br>
            <WordCloud job={job} animation={animation} />
        </div>
    )


}


export default Result