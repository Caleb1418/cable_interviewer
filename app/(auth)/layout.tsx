import React from 'react'

const authLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className='auth-layout'>{children}</div>
  )
}

export default authLayout