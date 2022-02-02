
// I want to create a class to be used. It should be able to:
// Store the current logged in user
// Return the current logged in user
// It should fire a callback when a user logs out.

import { get, post } from "./requests";
import { BASE_URL } from './environment'



class UserAuth {
    #TOKEN_KEY = 'UserAuth_jwtToken';
    #token = '';
    currentUser = {};
    #authStateChangeFns = [];

    constructor() {
        // Check if user is logged in.
        this.#token = localStorage.getItem(this.#TOKEN_KEY)
        if (this.#token) {
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

    setUserAndToken(user, token) {
        this.currentUser = user
        this.#token = token
        localStorage.setItem(this.#TOKEN_KEY, token);
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

    login(email, password) {
        return new Promise((resolve, reject) => {
            post(`${BASE_URL}/accounts/login`, { email, password })
                .then(res => {
                    if (res.data) {
                        const token = res.data.token;
                        const user = res.data.user;
                        this.setUserAndToken(user, token)
                        this.authStateChanged()
                        resolve(user)
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
    }

    getUser() {
        return this.currentUser ? this.currentUser : {}
    }

    registerUser(email, password) {
        return new Promise((resolve, reject) => {
            post(`${BASE_URL}/accounts/register`, { email, password })
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

    static updateAccount(user) {
        return new Promise((resolve, reject) => {
            post(`${BASE_URL}/accounts/update`, { user })
                .then(res => {
                    if (res.data) {
                        const updatedUser = res.data
                        console.log(updatedUser)
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

    static deleteAccount(pk) {
        // userPassword = { currentPassword, newPassword, pk }
        return new Promise((resolve, reject) => {
            post(`${BASE_URL}/accounts/delete`, { pk })
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
            post(`${BASE_URL}/accounts/create`, { user })
                .then(res => {
                    resolve(res)
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    static getAllAccounts() {
        return new Promise((resolve, reject) => {
            get(`${BASE_URL}/accounts/all`)
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
console.log("AUTHN CREATED!")
export { auth, UserAuth }