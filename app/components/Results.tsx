import React from 'react'
import { Tag } from '../types'


const Results = ({ job }) => {
    

    if (!job) {
        return null
    }

    const result = job.result

    if (result.length === 0) {
        return null
    }


    return (
        <table>
            <thead>
                <tr>
                    <th>Tag</th>
                    <th>Accuracy</th>
                    <th>Service</th>
                    <th>Parents</th>
                </tr>
            </thead>
            <tbody>
                    {
                        
                        result.map((tag: Tag, index: number) => {
                            
                            return (
                                <tr key={tag.label + tag.service + index}>
                                    <td>{tag.label}</td>
                                    <td> {Math.floor(tag.accuracy * 10000) / 100} %</td>
                                    <td> { tag.service }</td>
                                    <td> { tag.parents.map(parent => parent + ', ') } </td>
                                </tr>
                            )
                        })
                        
                    }
            </tbody>
        </table>
    )

}

export default Results