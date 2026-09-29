import { useContext,useEffect} from 'react'
import { AuthContext } from '../auth.context.jsx'
import {registerUser,LoginUser,logoutUser,getMe} from '../services/auth.api.js'
export const useAuth = () => {
    const context= useContext(AuthContext)
    const {user,setUser,loading,setLoading} = context

    const handleLogin = async (email,password) => {

        setLoading(true)
        try {
       const data =  await LoginUser({email,password})
       setUser(data.user)
        }catch (error) {
            console.error('Error logging in user:', error);
            throw error;
        }finally {
       setLoading(false)
        }
    }       
    const handleRegister = async (username,email,password) => {
        setLoading(true)
        try{
             const data = await registerUser({username,email,password}) 
        setUser(data.user)
        }
        catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }finally{
        setLoading(false)
        }
    }
    const handleLogout = async () => {
        setLoading(true)
        try{
            await logoutUser()
        setUser(null)
        }
        catch (error) {
            console.error('Error logging out user:', error);
            throw error;
        }finally{
        setLoading(false)
        }
    }
    useEffect(() => {
        const getAndSetUser = async () => {
            const data = await getMe()
            setUser(data.user)
            setLoading(false)
        }
        getAndSetUser()
    }, [])

    return{handleLogin,handleRegister,handleLogout,user,loading}
}