import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {query, collection, where, getDocs} from 'firebase/firestore'
import {db} from '../firebase'

import {FaVoteYea} from 'react-icons/fa'
import {GiPodiumWinner} from 'react-icons/gi'
import {RiAdminFill} from 'react-icons/ri'

const style ={
  container: `bg-slate-100 max-w-[600px] w-full m-auto rounded-md shadow-xl p-4`,
  form: `flex flex-col h-full justify-between`,
  input: `border p-4 w-full text-xl mb-4`,
  button: `text-white py-3 px-10 rounded-full text-lg font-medium text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 text-lg mx-auto max-w-[300px] mb-2 hover:bg-blue-600`,
  down: `absolute bottom-4 left-1/2 transform -translate-x-1/2`
}

const Home = ({ readData, setFetchCPFsOnButtonClicked, votacaoAberta  }) => {
  const [input, setInput] = useState('')
  const [isButtonDisable, setIsButtonDisable] = useState(false)

  const navigate = useNavigate()

  const handleResultados = async (page) => {
    setFetchCPFsOnButtonClicked(true);
    toast.info('Buscando...', { closeButton: false })
    const sitacaoCpf = await readData(input)
    if (sitacaoCpf.encontrado){
      toast.success('CPF Valido', { closeButton: false, onClose: () => { navigate(`/${page}`) } })
    }else{
      toast.error('CPF não válido', { closeButton: false })
    }
  }

  const checkAdmin = async () => {   
    const usuariosRef  = (collection(db, 'admin'))
    const q = query(usuariosRef, where('cpfsAdmins', 'array-contains', input));
    const querySnapshot = await getDocs(q);
  
    if (!querySnapshot.empty) {
      return true
    }else{
      return false
    }
  }


  const handleAdmin = async (page) => {
    if (page === 'admin'){
      if (input === process.env.REACT_APP_ADMIN_ACCESS){
        toast.success('Credencial Admin Ok', { closeButton: false, onClose: () => { navigate(`/${page}`) } })
        return
      }
    }
    setFetchCPFsOnButtonClicked(true);
    toast.info('Buscando...', { closeButton: false })
    const valueCheckAdmin = await checkAdmin()
    const sitacaoCpf = await readData(input)
    if (sitacaoCpf.encontrado){
      toast.success('CPF Valido', { closeButton: false})
      if (valueCheckAdmin){
        toast.success('CPF de Admin OK', { closeButton: false, onClose: () => { navigate(`/${page}`) } })
      }else{
        toast.error('CPF não é de Admin', { closeButton: false })
      }
    }else{
      toast.error('CPF não válido', { closeButton: false })
    }
  }

  const handleSubmit = async (page) => {
    setFetchCPFsOnButtonClicked(true);
    toast.info('Buscando...', { closeButton: false })
    const votacaoLiberada= await votacaoAberta
    if (votacaoLiberada){
      const sitacaoCpf = await readData(input)
      if (sitacaoCpf.encontrado){
         toast.success('CPF Valido', { closeButton: false })
         if(!sitacaoCpf.votado){
          toast.success('CPF Valido para Voto', { closeButton: false, onClose: () => { navigate(`/${page}`) } })
         }else{
          toast.error('CPF ja Votou', { closeButton: false })
         }
      }else{
          toast.error('CPF não válido', { closeButton: false })
        }
    }else{
      toast.error('Votacao Fechada', { closeButton: false })
    }
  }
  
  const checkCpf = (e) => {
    const inputValue = e.target.value;
    setInput(inputValue)
    setIsButtonDisable(inputValue.length > 10)//verifica se o input esta vazio, se for vazio dara o valor de true
  }

  return (
    <div className={style.container}>
      <ToastContainer position="top-center" autoClose={1000} hideProgressBar={false} />
      <form className={style.form}>
        <input className={style.input} type="text" placeholder='Insira seu CPF' onChange={checkCpf} value={input}/>
        <button 
          className={`${style.button} ${isButtonDisable ? `bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-800` : `opacity-50 cursor-not-allowed`}`} 
          disabled={!isButtonDisable}
          onClick={(e) => {
            e.preventDefault()
            handleSubmit('votar')
            }}><FaVoteYea size={30}/>Votar</button>
        <button 
          className={`${style.button} ${isButtonDisable ?  `bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-800` : `opacity-50 cursor-not-allowed`}`} 
          disabled={!isButtonDisable}
          onClick={(e) => {
            e.preventDefault()
            handleResultados('resultados')
            }}><GiPodiumWinner size={30}/>Ver Resultados</button>
        <button 
          className={ `${style.button}  ${style.down} ${isButtonDisable ?  `bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-800` : `opacity-50 cursor-not-allowed`}` }
          disabled={!isButtonDisable}
          onClick={(e) => {
            e.preventDefault()
            handleAdmin('admin')
            }}><RiAdminFill size={30}/>Painel Administrador</button>
      </form>
    </div>
  )
}

export default Home