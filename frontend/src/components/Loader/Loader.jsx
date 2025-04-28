import React from 'react'
import { ScaleLoader } from 'react-spinners'

function Loader() {
    return (
        <div className='flex justify-center w-100 h-screen items-center'>
            <ScaleLoader color="#6d67ff" height={50} width={10} radius={2} margin={4} />
        </div>
    )
}

export default Loader