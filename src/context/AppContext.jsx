import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser as logoutFromAuth } from "../utils/authApi";

const AppContext = createContext()

export const AppContextProvider = ({ children }) => {

    const navigate = useNavigate()
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");


    const fetchUser = async () => {
        try {
            const userData = await getCurrentUser()
            setUser(userData)
            localStorage.setItem("user", JSON.stringify(userData))
        } catch (error) {
            setUser(null)
        }
    }

    const loginUser = (userData) => {
        // userData comes from backend, tokens are already stored by authApi
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
    }

    const logoutUser = () => {
        setUser(null)
        logoutFromAuth()
        navigate("/login")
    }
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === "light" ? "dark" : "light")
    }

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
        localStorage.setItem("theme", theme)
    }, [theme])

    // Check for existing token on mount
    useEffect(() => {
        fetchUser()
    }, [])

    const value = {
        navigate, user, setUser, fetchUser, loginUser, logoutUser,
        theme, setTheme, toggleTheme
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)