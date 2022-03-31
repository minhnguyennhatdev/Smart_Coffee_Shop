import React, { createContext, useReducer, useEffect } from 'react'
import authReducer from '../reducers/authReducer'
import axios from 'axios'
import setAuthToken from '../utils/setAuthToken'
import { useRouter } from 'next/router'
import { 
    apiUrl, 
    LOCAL_STORAGE_TOKEN_NAME 
} from '../reducers/constants'

export const AuthContext = createContext()

const AuthContextProvider = ({ children }) => {
	const [authState, dispatch] = useReducer(authReducer, {
		authLoading: true,
		isAuthenticated: false,
		user: null
	})

	// Authenticate user
	const loadUser = async () => {
		if (localStorage[LOCAL_STORAGE_TOKEN_NAME]) {
			setAuthToken(localStorage[LOCAL_STORAGE_TOKEN_NAME])
		}
		try {
			const response = await axios.get(`${apiUrl}/api/user`)
			if (response.data.success) {
				dispatch({
					type: 'SET_AUTH',
					payload: { isAuthenticated: true, user: response.data.user }
				})
			}
		} catch (error) {
			localStorage.removeItem(LOCAL_STORAGE_TOKEN_NAME)
			setAuthToken(null)
			dispatch({
				type: 'SET_AUTH',
				payload: { isAuthenticated: false, user: null }
			})
		}
	}

	useEffect(() => {
		loadUser()
	}, [])

	// Login
	const loginUser = async userForm => {
		try {
			const response = await axios.post(`${apiUrl}/api/user/login`, userForm)
			if (response.data.success) {
				localStorage.setItem(
					LOCAL_STORAGE_TOKEN_NAME,
					response.data.accessToken
				)
			}
			await loadUser()
			return response.data
		} catch (error) {
			if (error.response.data) return error.response.data
			else return { success: false, message: error.message }
		}
	}

	// Logout
	const logoutUser = () => {
		localStorage.removeItem(LOCAL_STORAGE_TOKEN_NAME)
		dispatch({
			type: 'SET_AUTH',
			payload: { isAuthenticated: false, user: null }
		})
	}

	// Context data
	const authContextData = { loginUser, logoutUser, authState, loadUser }

	// Return provider
	return (
		<AuthContext.Provider value={authContextData}>
			{children}
		</AuthContext.Provider>
	)
}

export default AuthContextProvider
