import axios from "axios";
const api =axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // Include credentials (cookies) in requests
});

export async function registerUser({username, email, password}) {
    try {
        const response = await api.post('/api/auth/register', {
            username,
            email,
            password
        },{
            withCredentials: true, // Include credentials (cookies) in the request
        });
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}
export async function loginUser({email, password}) {
    try {
        const response = await api.post('/api/auth/login', {email, password}, {
            withCredentials: true, // Include credentials (cookies) in the request
        });
        return response.data;
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }   
}
export async function logoutUser() {
    try {
        const response = await api.get('/api/auth/logout', {}, {
            withCredentials: true, // Include credentials (cookies) in the request
        });
        return response.data;
    } catch (error) {
        console.error('Error logging out user:', error);
        throw error;
    }
}
export async function getMe() {
    try {
        const response = await api.get('/api/auth/get-me', {
            withCredentials: true, // Include credentials (cookies) in the request
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
    }
}