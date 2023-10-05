import React, {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'

import {FaVoteYea} from 'react-icons/fa'
import {GiPodiumWinner} from 'react-icons/gi'
import {RiAdminFill} from 'react-icons/ri'

const style ={
  container: `bg-slate-100 max-w-[600px] w-full m-auto rounded-md shadow-xl p-4`,
  form: `flex flex-col h-full justify-between`,
  input: `border p-2 w-full text-xl mb-4`,
  button: `bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-800 text-white py-3 px-10 rounded-full text-lg font-medium text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 text-lg mx-auto max-w-[300px] mb-2 hover:bg-blue-600`,
  down: `absolute bottom-4 left-1/2 transform -translate-x-1/2`
}

const Home = () => {
  const navigate = useNavigate()

  const handleSubmit = (page) => {
    navigate(`/${page}`)
}

  return (
    <div className={style.container}>
      <form className={style.form}>
        <input className={style.input} type="text" placeholder='Insira seu CPF'/>
        <button 
          className={style.button} 
          onClick={(e) => {
            e.preventDefault()
            handleSubmit('votar')
            }}><FaVoteYea size={30}/>Votar</button>
        <button 
          className={style.button} 
          onClick={(e) => {
            e.preventDefault()
            handleSubmit('resultados')
            }}><GiPodiumWinner size={30}/>Ver Resultados</button>
        <button 
          className={ `${style.button}  ${style.down}` }
          onClick={(e) => {
            e.preventDefault()
            handleSubmit('admin')
            }}><RiAdminFill size={30}/>Painel Administrador</button>
      </form>
    </div>
  )
}

export default Home