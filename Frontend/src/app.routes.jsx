import {createBrowserRouter, RouterProvider} from "react-router-dom";
import { Register } from "./features/auth/pages/Register";
import { Login } from "./features/auth/pages/Login";
import Protected from "./features/auth/components/Protected";



export const router = createBrowserRouter([
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/",
        element:  <Protected><h1>Welcome to the protected route!</h1></Protected>
    }
]); 