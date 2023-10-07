import React, {useState, useEffect} from 'react'
import { Route, Routes } from "react-router-dom";

import {query, collection, onSnapshot, where, getDocs,} from 'firebase/firestore'
import {db} from './firebase'

import Home from './components/Home'
import Votar from './components/Votar'
import Admin from './components/Admin'
import Resultados from './components/Resultados'


const style = {
  bg: `h-screen w-screen p-4 bg-gradient-to-r from-[#2F80ED] to-[#1CB5E0]`
}

function App() {
  const [cpfs, setCpfs] = useState([])
  const [fetchCPFsOnButtonClicked, setFetchCPFsOnButtonClicked] = useState(false);
  const [idUser, setIdUser] = useState(0)

  //Read cpf from firebase
  const fetchCPFs = ()=> {
    const q = query(collection(db, 'cpfs'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let cpfsArr = []
      querySnapshot.forEach((doc) => {
        cpfsArr.push({...doc.data(), id: doc.id})
      })
      setCpfs(cpfsArr)
    })
    return () => unsubscribe()
  }

  useEffect(() => {
    if (fetchCPFsOnButtonClicked) {// Chamar a função para buscar CPFs somente se fetchCPFsOnButtonClicked for verdadeiro
      fetchCPFs();// Resetar o estado para que não busque novamente automaticamente
      setFetchCPFsOnButtonClicked(false);
    }
  }, [fetchCPFsOnButtonClicked]);

  async function readData(cpf) {
    const usuariosRef  = (collection(db, 'cpfs'))
    const q = query(usuariosRef, where('cpf', '==', cpf));
    const querySnapshot = await getDocs(q);
  
    if (!querySnapshot.empty) {
      // CPF encontrado no banco de dados
      const doc = querySnapshot.docs[0]; // Pega o primeiro documento correspondente
      setIdUser(doc.id)
      return true;
    } else {
      // CPF não encontrado no banco de dados
      return false;
    }
  }

  return (
      <div className={style.bg}>
        <h1 className='text-center text-3xl font-bold p-4'>Votação de Funcionários</h1>
        <Routes>
          <Route path='/' element={<Home readData = {readData} setFetchCPFsOnButtonClicked={setFetchCPFsOnButtonClicked} />} />
          <Route path='/Votar' element={<Votar idUser={idUser} cpfs={cpfs} fetchCPFs={fetchCPFs} />} />
          <Route path='/Resultados' element={<Resultados />} />
          <Route path='/Admin' element={<Admin />} />
        </Routes>
      </div>
  );
}

export default App;
