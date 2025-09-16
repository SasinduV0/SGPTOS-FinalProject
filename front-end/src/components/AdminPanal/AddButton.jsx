import { Plus } from 'lucide-react'
import React from 'react'

const AddButton=({handleAddEntry, text="Add Entry"})=> {
  return (
    <button
        onClick={handleAddEntry}
        className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium'>

            <Plus size={18}/>

            {text}

        </button>
  )
}

export default AddButton