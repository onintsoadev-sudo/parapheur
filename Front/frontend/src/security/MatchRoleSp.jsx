import React, { useEffect, useContext } from 'react'
import { userContext } from '../components/ContextWrapper'
import { useLocation, useNavigate } from 'react-router-dom'

function MatchRoleSp({children}) {
    const {user} = useContext(userContext)
    const navigate = useNavigate()
    useEffect(() => {
        // On attend que /user ait répondu (role défini) avant de juger :
        // sinon un simple rechargement de page renvoie vers /login.
        if(user.role && user.role !== 'sp'){
            navigate('/login')
        }
    }, [])
  return (
    <>
        {children}
    </> 
  )
}

export default MatchRoleSp