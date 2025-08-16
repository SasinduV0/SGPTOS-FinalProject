import React from 'react'

function Security() {
  return (
    <div>
        <div>
            <h2 className="text-x1 font-bold text-center">security setup</h2>
            <p className="text-x1 font-bold text-center">Configure login credentials and security options</p>
        </div>

        <div>
            <div>
                <lable htmlfor="employeeId" classname="block mb-1">Password</lable>
                <input
                type="password"
                placeholder="Enter Password (min 8 char)"
                className="border rounded-lg p-2 mt-2 w-full"/>
            </div>

            <div>
                <label htmlfor="employeeId" classname="block mb-1">Confirm Password</label>
                <input
                type="password"
                placeholder="Confirm password"
                className="border rounded-lg p-2 mt-2 w-full"/>
            </div>
        </div>
    </div>
  )
}

export default Security