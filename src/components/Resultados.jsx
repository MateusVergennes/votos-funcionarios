import React, { useEffect, useState } from 'react'

import {query, collection, onSnapshot} from 'firebase/firestore'
import {db} from '../firebase'

import { ToastContainer, toast } from 'react-toastify';

const style = {
  cb_bg:`bg-gray-100 max-w-[400px] mx-auto p-4 rounded-md shadow-md m-4`,
  cb_label: `block text-gray-700 text-lg font-semibold mb-2`,
  cb_select: `p-2 border rounded-md w-full`,
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
  const [valoresUnicos, setValoresUnicos] = useState([])//para o numVoto, para saber de qual votacao estamos tratando
  const [valorSelecionado, setValorSelecionado] = useState(0)//voto ser analisada
  const [nomeVencedor, setNomeVencedor] = useState('')

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

  useEffect(() => {
    // Extrair valores únicos de numVotacao
    const valores = [...new Set(votos.map(voto => voto.numVotacao))]//new Set, pois elimina valores duplicados pelo js
    setValoresUnicos(valores)
  }, [votos])

  const handleSelecaoChange = (event) => {
    const valorSelecionado = parseInt(event.target.value)
    setValorSelecionado(valorSelecionado)
  }



  function calcularResultadoTotalVotacao() {
    const resultados = [];

    votos.forEach((v) => {
      if (v.numVotacao === valorSelecionado){
        v.idCpfVotado.forEach((vIdCVotado) => {
          resultados.push(vIdCVotado)
        })
      }
    })
    return resultados;
  }

  function calcularResultadoPQuestaoVotacao() {
    const votosPorQuestao = {}
    for (const voto of votos) {
      if (voto.numVotacao === valorSelecionado){
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
    }
    return votosPorQuestao
  }

  const votosTotais = calcularResultadoTotalVotacao()
  
  const contagemVotos = {}
  votosTotais.forEach((id) =>{
    if (contagemVotos[id]){
      contagemVotos[id]++
    }else{
      contagemVotos[id] = 1
    }
  }) 

  const votosPQuestao = calcularResultadoPQuestaoVotacao()

  const resultadosPorQuestao = {}
  for (const questaoIndividual in votosPQuestao){//"questaoIndividual" será uma string representando o nome da questão (por exemplo, "questao1" ou "questao2").
    const votosDaQuestao = votosPQuestao[questaoIndividual] //"votosDaQuestao" agora é um array contendo os idCPFs que votaram nessa questão.
    const votosPorId = {}
    for (const votoId of votosDaQuestao){ //"votoId" será uma string representando um id específico do funcionario (por exemplo, "cpf2" ou "cpf1").
      if (votosPorId[votoId]){
        votosPorId[votoId]++ // Incrementa a contagem de votos do idCPF
      }else{
        votosPorId[votoId] = 1 // Inicia a contagem de votos do idCPF
      }
    }
    // Armazena os resultados da questão no objeto principal
    resultadosPorQuestao[questaoIndividual] = votosPorId
  }  

  const funcionarioMes = () => {
    let vencedor = null
    let maiorNumeroDeVotos = -1

    for (const votoId in contagemVotos){
      if (contagemVotos.hasOwnProperty(votoId)){ //verifica se a variável votos tem uma propriedade com o nome especificado 
        const votosCandidato = contagemVotos[votoId]

        if (votosCandidato > maiorNumeroDeVotos){
          maiorNumeroDeVotos = votosCandidato
          vencedor = votoId
        }
      }
    }
    return [vencedor, maiorNumeroDeVotos]//retorna o vencedor e seu numero de votos
  }

  const funcionarioMesArr = funcionarioMes()

  useEffect(() => {
    function takeNomeVencedor() {
      let nomeVencedorT
      cpfs.forEach((cpf) => {
          if (cpf.id === funcionarioMesArr[0]){
            nomeVencedorT = cpf.nome
          }
        })
      return nomeVencedorT
    }
  
    setNomeVencedor(takeNomeVencedor())

  }, [funcionarioMesArr])

  function handleFuncionariosQuestao (questaoAtual) {
    let questaoAtualId = ''
    Object.keys(questaoAtual).forEach(() => {
      questaoAtualId = (questaoAtual['id'])
    })

    let resultadoQuestaoAtualId = ''
    Object.keys(resultadosPorQuestao).forEach((rpqId) => {
      if (rpqId === questaoAtualId) {
        resultadoQuestaoAtualId = (resultadosPorQuestao[rpqId])//assim tenho um objeto com ids e seus votos respectivos
        cpfs.forEach((cpf) => {//trocar os ids por nomes dos ids respectivos
          if (resultadoQuestaoAtualId.hasOwnProperty(cpf.id)){//se o id do objeto houver em cpf.id, no proximo passo copiamos o valor da chave antiga, no novo nome e apagamos posteriormente a antiga
            resultadoQuestaoAtualId[cpf.nome] = resultadoQuestaoAtualId[cpf.id]
            delete resultadoQuestaoAtualId[cpf.id]
          }
        })
      }
    })
     return (
      <div>
        {Object.keys(resultadoQuestaoAtualId).map((chave) => (
          <p key={chave}>{chave}: {resultadoQuestaoAtualId[chave]}</p>
        ))}
      </div>
    )
  }

  

  return (
    <div>
      <div className={style.cb_bg}>
        <label className={style.cb_label}>Selecione a Votação:</label>
          <select className={style.cb_select} onChange={handleSelecaoChange} value={valorSelecionado}>
            {valoresUnicos.map((valor, index) => (
              <option key={index} value={valor}>
                {valor}
              </option>
            ))}
          </select>
      </div>
      <div className={style.container}>
      <ToastContainer position="top-center" autoClose={1000} hideProgressBar={false} />
        <p className={style.title}>Resultados das Votações de Funcionário do Mês</p>
          <h2 className={style.defFuncMes}>O Funcionário do Mês é: </h2>
            <h1 className={style.funcMes}>{nomeVencedor} com {funcionarioMesArr[1]} Votos, Parabéns!!!</h1>
      </div>
      <div className={style.container}>
        <p className={style.title}>Resultados Gerais das Votações de Funcionário do Mês</p>
          {questoes.map((questao, index) => (
            <div key={index} >
              <h1 className={style.designquestao}>{questao.questao}</h1>
              {handleFuncionariosQuestao(questao)}
              
            </div>
          ))}
      </div>
    </div>
  )
}

export default Resultados