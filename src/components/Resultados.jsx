import React, { useEffect, useState } from 'react'

import {query, collection, onSnapshot} from 'firebase/firestore'
import {db} from '../firebase'

import { ToastContainer, toast } from 'react-toastify';

const style = {
  container: `bg-slate-100 max-w-[700px] w-full m-auto rounded-md shadow-xl p-4 mb-4`,
  title: `text-2xl font-bold mb-4 text-center`,
  defFuncMes: `text-lg font-semibold mb-2`,
  designquestao: `text-xl font-bold m-4`,
  barraProgresso: `poll__option-fill w-1/2 h-2 bg-gray-300`,
}

const Resultados = () => {
  const [cpfs, setCpfs] = useState([])
  const [questoes, setQuestoes] = useState([])
  const [votos, setVotos] = useState([])

  useEffect(()=> {
//pega as questoes os ids das questoes
const getQuestoes = async () => {
  const q = query(collection(db, 'questoes'))
  const unsubscribe = await onSnapshot(q, (querySnapshot) => {
    let questoesArr = []
    querySnapshot.forEach((doc) => {
      questoesArr.push({questao: doc.data().questao, id: doc.id})
    })
    setQuestoes(questoesArr)
  })
  return () => unsubscribe()
}

//pega os nomes e id dos funcionarios
  const getCpfs = async () => {
    const q = query(collection(db, 'cpfs'))
    const unsubscribe = await onSnapshot(q, (querySnapshot) => {
      let cpfsArr = []
      querySnapshot.forEach((doc) => {
        cpfsArr.push({nome: doc.data().nome, id: doc.id})
      })
      setCpfs(cpfsArr)
    })
    return () => unsubscribe()
  }

//pega os votos, id dos votados e id das questoes
  const getVotos = async () => {
    const q = query(collection(db, 'votos'))
    const unsubscribe = await onSnapshot(q, (querySnapshot) => {
      let votosArr = []
      querySnapshot.forEach((doc) => {
        votosArr.push({idCpfVotado: doc.data().idCpfVotado, idQuestao:doc.data().idQuestao, numVotacao: doc.data().numVotacao, id: doc.id})
      })
      setVotos(votosArr)
    })
    return () => unsubscribe()
  }

//chamada das consultas no useEffect
  Promise.all([getCpfs(), getQuestoes()], getVotos())
    .then(()=> {
      toast.success('Consulta realizada com Sucesso', { closeButton: false } )
    })
    .catch((error) => {
      toast.error(`erro: ${error}`, { closeButton: false })
    })
    
  }, [])
  
  //console.log(cpfs)
  //console.log(questoes)
  //console.log(votos)

  function calcularResultadoTotalVotacao() {
    const resultados = [];
  
    votos.forEach((v) => {
      v.idCpfVotado.forEach((vIdCVotado) => {
        resultados.push(vIdCVotado)
      })
    })
    return resultados;
  }

  function calcularResultadoPQuestaoVotacao() {
    const votosPorQuestao = {}
    for (const voto of votos) {
      const { idQuestao, idCpfVotado } = voto
      
      for (let i = 0; i < idQuestao.length; i++) {
        const questaoId = idQuestao[i]
        const votado = idCpfVotado[i]
        
        if (!votosPorQuestao[questaoId]) {
          votosPorQuestao[questaoId] = []
        }
        
        votosPorQuestao[questaoId].push(votado)
      }
    }
    return votosPorQuestao
  }

  
  const votosPQuestao = calcularResultadoPQuestaoVotacao()
  
  const questaoId = "id1"
  if (votosPQuestao.hasOwnProperty(questaoId)) {
    const votosDaQuestao = votosPQuestao[questaoId]
    console.log(`Votos para a questão ${questaoId}:`, votosDaQuestao)
  } else {
    console.log(`A questão ${questaoId} não possui votos.`)
  }
  

  return (
    <div>
      <div className={style.container}>
      <ToastContainer position="top-center" autoClose={1000} hideProgressBar={false} />
        <p className={style.title}>Resultados das Votações de Funcionário do Mês</p>
          <h2 className={style.defFuncMes}>O Funcionário do Mês é: </h2>
            <h1 className={style.funcMes}>Kleber</h1>
      </div>
      <div className={style.container}>
        <p className={style.title}>Resultados Gerais das Votações de Funcionário do Mês</p>
          {questoes.map((questao, index) => (
            <div key={index} >
              <h1 className={style.designquestao}>{questao.questao}</h1>
              {cpfs.map((cpf, index) => (
                <div key={index} >
                  <p className={style.barraProgresso}></p>
                  <h2 className={style.funcMes}>{cpf.nome}</h2>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  )
}

export default Resultados