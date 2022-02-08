import { useState, useEffect } from "react";
import axios from 'axios';
import {toast} from 'react-toastify'
import React from 'react'
import Loading from "../components/Loading";
import factory from '../ethereum/factory'
import web3 from "../ethereum/web3";
const AuthContext = React.createContext({
    user : {},
    election : '',
    loading: false,
    validAccount: false,
    setUser: () => {},
    notify:() => {},
    getAccount: () =>{},
    setElection: () => {}
})

export const AuthContextProvider = (props) => {

    const [user, setUser] = useState();
    const [loading, setLoading] = useState(false);
    const [validAccount, setValidAccount] = useState(false);
    const [election, setElection] = useState('0x0000000000000000000000000000000000000000');
    let account;
    
    window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        getAccount();
  })
  async function getAccount() {
    const accounts = await window.ethereum.enable();
    account = accounts[0];
    if(user){
      //accounts = await web3.eth.getAccounts();
      setValidAccount(accounts[0].toUpperCase() === user.eAddress.toUpperCase()) 
    }
    // do something with new account here
  }
    useEffect( ()=> {
        console.log('useEffect');
        (async () => {
            setLoading(true);
            try{
            const response = await axios.get('http://localhost:4000/api/election/getUser',{
                withCredentials: true,
            });
            setUser(response.data.user);
            }
            catch(err){

            }
            
                const accounts = await web3.eth.getAccounts();
                account = accounts[0]
              
        })()
        
        setLoading(false);
        }, [setUser])
    
    useEffect( async () => {
        setLoading(true);
        setElection(await factory.methods.deployedElection().call());
        console.log(election);
        setLoading(false);
    },[])

    // useEffect( async() => {
    //     if(user){
    //         const accounts = await web3.eth.getAccounts();
    //         setValidAccount(accounts[0].toUpperCase() === user.eAddress.toUpperCase()) 
    //         console.log(validAccount)
    //       }
    // },[account])


    const notify = (message, status) => {

            switch(status){
            case 'error': 
            toast.error(message,{
                autoClose:3000,
                position: toast.POSITION.BOTTOM_RIGHT,
            })
            break;

            case 'success':
            toast.success(message, {
                autoClose:3000,
                position: toast.POSITION.BOTTOM_RIGHT
            });
            break;


            };
    }  
      return(
      <>
        {!loading&&<AuthContext.Provider
            value={{
                user: user,
                setUser: setUser,
                notify: notify,
                election: election,
                loading: loading,
                validAccount: validAccount,
                getAccount: getAccount,
                setElection: setElection
            }} >
                {props.children}
        </AuthContext.Provider>}
        {loading && <Loading />}
      </>
    )
}

export default AuthContext;