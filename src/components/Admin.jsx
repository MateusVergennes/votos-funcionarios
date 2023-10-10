import React, { useEffect, useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import Switch from 'react-switch';

import { ToastContainer, toast } from 'react-toastify';

import {db} from '../firebase'
import {query, collection, onSnapshot, updateDoc, doc, addDoc, deleteDoc} from 'firebase/firestore'

const style = {
  container: `bg-slate-100 max-w-[500px] w-full m-auto rounded-md shadow-xl p-4 mb-4`,
  containerVote: `flex justify-between`,
  form: `flex justify-between`,
  input: `border p-2 w-full text-xl`,
  button: `border p-4 ml-2 bg-purple-500 text-slate-100 hover:bg-purple-600`,
  title: `text-center text-xl p-2`,
  toggleContainer: `flex items-center justify-center`,
  nomes: `flex justify-between bg-slate-200 p-4 my-2 capitalize`,
};

const Admin = () => {
  const [votacaoAberta, setVotacaoAberta] = useState(false);
  const [cpfs, setCpfs] = useState([])
  const [questoes, setQuestoes] = useState([])

//Read todo from firebase
useEffect(()=> {
  const getCpfs = async () => {
    const q = query(collection(db, 'cpfs'))
    const unsubscribe = await onSnapshot(q, (querySnapshot) => {
      let cpfsArr = []
      querySnapshot.forEach((doc) => {
        cpfsArr.push({...doc.data(), id: doc.id})
      })
      setCpfs(cpfsArr)
    })
    return () => unsubscribe()
  }
  const getQuestoes = async () => {
    const q = query(collection(db, 'questoes'))
    const unsubscribe = await onSnapshot(q, (querySnapshot) => {
      let questoesArr = []
      querySnapshot.forEach((doc) => {
        questoesArr.push({...doc.data(), id: doc.id})
      })
      setQuestoes(questoesArr)
    })
    return () => unsubscribe()
  }

  Promise.all([getCpfs(), getQuestoes()])
    .then(()=> {
      toast.success('Consulta realizada com Sucesso', { closeButton: false } )
    })
    .catch((error) => {
      toast.error(`erro: ${error}`, { closeButton: false })
    })
  }, [])


  const toggleVotacao = () => {
    setVotacaoAberta((prev) => !prev);
  };

  const adicionarVotacao = () => {
    // Adicione aqui a lógica para adicionar uma nova votação
    console.log('Nova votação adicionada.');
  };

  return (
    <div>
      <ToastContainer position="top-center" autoClose={1000} hideProgressBar={false} />
      <div className={style.container}>
        <p className={`${style.title} ${style.buttonAdd}`}>Controle da Votação</p>
        <div className={style.containerVote}>
          <div className={style.toggleContainer}>
            <label htmlFor="toggleSwitch" className="mr-2">
              {votacaoAberta ? 'Aberta' : 'Fechada'}
            </label>
            <Switch
              id="toggleSwitch"
              checked={votacaoAberta}
              onChange={toggleVotacao}
              onColor="#8e44ad" // Cor roxa
              onHandleColor="#6c3483" // Cor roxa escura
              offColor="#d3d3d3"
              offHandleColor="#ffffff"
              handleDiameter={30}
              uncheckedIcon={false}
              checkedIcon={false}
            />
          </div>
          <button className={style.button} onClick={adicionarVotacao}>Adicionar Votação</button>
        </div>
      </div>      
      <div className={style.container}>
        <p className={style.title}>Adicione Votantes</p>
        <form className={style.form}>
          <input className={style.input}></input>
          <button className={style.button}>
            <AiOutlinePlus size={30} />
          </button>
        </form>
        {cpfs.map((cpf, index) => (
          <p key={index} className={style.nomes}>{cpf.nome}</p>
        ))}
      </div>
      <div className={style.container}>
        <p className={style.title}>Adicione Questões</p>
        <form className={style.form}>
          <input className={style.input}></input>
          <button className={style.button}>
            <AiOutlinePlus size={30} />
          </button>
        </form>
        {questoes.map((questao, index) => (
          <p key={index} className={style.nomes}>{questao.questao}</p>
        ))}
      </div>
    </div>
  )
}

export default Admin;
