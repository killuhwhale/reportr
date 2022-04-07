
// I want to create a class to be used. It should be able to:
// Store the current logged in user
// Return the current logged in user
// It should fire a callback when a user logs out.

import { get, post } from "./requests";
import { BASE_URL } from './environment'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, COMPANY_ID_KEY } from './constants'


class UserAuth {
    #ACCESS_TOKEN_KEY = ACCESS_TOKEN_KEY;
    #REFRESH_TOKEN_KEY = REFRESH_TOKEN_KEY;
    #COMPANY_KEY = COMPANY_ID_KEY;
    #accessToken = '';
    #refreshToken = '';
    currentUser = {};
    #authStateChangeFns = [];

    constructor() {
        // Check if user is logged in.
        this.#accessToken = localStorage.getItem(this.#ACCESS_TOKEN_KEY)
        if (this.#accessToken) {
            this.getUserByToken();
        }
    }

    onAuthStateChange(fn) {
        this.#authStateChangeFns.push(fn);
        fn(this.currentUser)
    }

    authStateChanged() {
        this.#authStateChangeFns.forEach(fn => {
            fn(this.currentUser)
        })
    }

    setUserAndToken(user, accessToken, refreshToken) {
        this.currentUser = user
        this.updateTokens(accessToken, refreshToken)
    }

    updateTokens(accessToken, refreshToken) {
        this.#accessToken = accessToken
        this.#refreshToken = refreshToken
        localStorage.setItem(this.#ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(this.#REFRESH_TOKEN_KEY, refreshToken);
    }

    getUserByToken() {
        post(`${BASE_URL}/accounts/currentUser`, {})
            .then(res => {
                if (res.data) {
                    this.currentUser = res.data
                    this.authStateChanged()
                } else {
                    console.log("Error getting current user.")
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    setCompanyID(company_id) {
        localStorage.setItem(this.#COMPANY_KEY, company_id);
    }

    login(email, password) {
        return new Promise((resolve, reject) => {
            post(`${BASE_URL}/accounts/login`, { email, password })
                .then(res => {
                    if (res.data) {
                        const accessToken = res.data.accessToken.token;
                        const refreshToken = res.data.refreshToken.token;

                        const user = res.data.user;
                        this.setUserAndToken(user, accessToken, refreshToken)
                        this.setCompanyID(user.company_id)
                        this.authStateChanged()
                        resolve(user)
                    } else {
                        reject(res.error)
                    }
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    logout() {
        this.setUserAndToken(null, '')
        this.authStateChanged();
        this.setCompanyID('')
    }

    getUser() {
        return this.currentUser ? this.currentUser : {}
    }


    // For Dev use, create account for a company
    registerUser(email, password, company_id) {
        return new Promise((resolve, reject) => {
            post(`${BASE_URL}/accounts/register`, { email, password, company_id })
                .then(res => {
                    if (!res.error) {
                        resolve(res)
                    } else {
                        reject(res.error)
                    }
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }


    // Register Site Admin. For Dev use
    registerHacker(email, password) {
        return new Promise((resolve, reject) => {
            post(`${BASE_URL}/accounts/registerAdmin`, { email, password, SECRET: "1337mostdope#@!123(*)89098&^%%^65blud" })
                .then(res => {
                    if (res.data) {
                        const { data: { user, token } } = res
                        this.setUserAndToken(user, token)
                        resolve(user)

                    } else {
                        reject(res.error)
                    }
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    refreshToken() {
        const refreshToken = localStorage.getItem(this.#REFRESH_TOKEN_KEY);
        if (!refreshToken) return

        post(`${BASE_URL}/accounts/accessToken`, { refreshToken })
            .then(res => {
                if (res.error) return
                const accessToken = res.token
                this.updateTokens(accessToken, refreshToken)
                this.authStateChanged()
            })
            .catch(err => {
                console.log(err)
            })

    }

    static updateAccount(user) {
        return new Promise((resolve, reject) => {
            post(`${BASE_URL}/accounts/update`, { user })
                .then(res => {
                    if (res.data) {
                        const updatedUser = res.data
                        resolve(updatedUser)
                    } else {
                        console.log(res.error)
                        reject(res.error)
                    }
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static changePassword(userPassword) {
        // userPassword = { currentPassword, newPassword, pk }
        return new Promise((resolve, reject) => {
            post(`${BASE_URL}/accounts/changePassword`, { userPassword })
                .then(res => {
                    if (res.data) {
                        const updatedUser = res.data
                        resolve(updatedUser)
                    } else {
                        console.log(res.error)
                        reject(res.error)
                    }
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static deleteAccount(pk, company_id) {
        // userPassword = { currentPassword, newPassword, pk }
        return new Promise((resolve, reject) => {
            post(`${BASE_URL}/accounts/delete`, { pk, company_id })
                .then(res => {
                    if (res.data) {
                        const deletedUser = res.data
                        resolve(deletedUser)
                    } else {
                        console.log(res.error)
                        reject(res.error)
                    }
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    // Allows owner account to create a new user acount.
    // This will be available under Account Management for Owners.
    // 
    static createUser(user) {
        return new Promise((resolve, reject) => {
            post(`${BASE_URL}/accounts/create`, user)
                .then(res => {
                    resolve(res)
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static getAllAccounts(companyID) {
        return new Promise((resolve, reject) => {
            get(`${BASE_URL}/accounts/all/${companyID}`)
                .then(res => {
                    resolve(res)
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static sendPasswordResetEmail(email) {
        return new Promise((resolve, reject) => {
            console.log("Send password reset email to: ", email)
            resolve("Sent email!")
        })
    }

}

const auth = new UserAuth()
export { auth, UserAuth }