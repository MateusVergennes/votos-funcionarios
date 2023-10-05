import React from 'react'
import { Route, Routes } from "react-router-dom";

import Home from './components/Home'
import Votar from './components/Votar'
import Admin from './components/Admin'
import Resultados from './components/Resultados'


const style = {
  bg: `h-screen w-screen p-4 bg-gradient-to-r from-[#2F80ED] to-[#1CB5E0]`
}

function App() {

  return (
      <div className={style.bg}>
        <h1 className='text-center text-3xl font-bold'>Votação de Funcionários</h1>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/Votar' element={<Votar />} />
          <Route path='/Resultados' element={<Resultados />} />
          <Route path='/Admin' element={<Admin />} />
        </Routes>
      </div>
  );
}

export default App;
