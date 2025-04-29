import React from 'react'
import { ScaleLoader } from 'react-spinners'

function ChatLoader() {
    return (
        <div className='flex justify-center w-100 h-[65vh] items-center'>
            <ScaleLoader color="#c1bae0" height={50} width={10} radius={2} margin={4} />
        </div>
    )
}

export default ChatLoader