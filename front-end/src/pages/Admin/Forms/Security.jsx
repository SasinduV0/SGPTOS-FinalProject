import React from 'react'

function Security({ formData, setFormData }) {
  return (
    <div>
        <div>
            <h2 className="text-x1 font-bold text-center">security setup</h2>
            <p className="text-x1 font-bold text-center">Configure login credentials and security options</p>
        </div>

        <div>
            <div>
                <label htmlFor="password" className="block mb-1">Password</label>
                <input
                type="password"
                name="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value})}
                placeholder="Enter Password (min 8 char)"
                className="border rounded-lg p-2 mt-2 w-full"/>
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block mb-1">Confirm Password</label>
                <input
                type="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value})}
                placeholder="Confirm password"
                className="border rounded-lg p-2 mt-2 w-full"/>
            </div>
        </div>
    </div>
  )
}

export default Security