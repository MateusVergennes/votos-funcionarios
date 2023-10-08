import React, { useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom'

import { ToastContainer, toast } from 'react-toastify';

import {query, collection, onSnapshot, addDoc, updateDoc, doc, getDoc} from 'firebase/firestore'
import {db} from '../firebase'

const style ={
  container: `bg-slate-100 max-w-[600px] w-full m-auto rounded-md shadow-xl p-4`,
  form: `flex flex-col h-full justify-between`,
  botao: `bg-blue-500 text-white font-semibold py-2 rounded-md mt-4`,
  questao:`text-xl font-bold mb-2`,
  option: `mb-2`,
  buscaIndice: `text-center text-red-500 font-semibold text-lg mt-4`,
}

let indiceOculto = -1

const Votar = ({idUser, cpfs, fetchCPFs, stsVotacao, votacaoAberta}) => {
  const [indexQuestaoAtual, setIndexQuestaoAtual] = useState(0)
  const [opcaoSelecionada, setOpcaoSelecionada] = useState([])
  const [funcionarios, setFuncionarios] = useState([])
  const [idFuncionarios, setIdFuncionarios] = useState([])
  const [questoes, setQuestoes] = useState([])
  const [idQuestoes, setIdQuestoes] = useState([])
  const [consultaCpfVotado, setConsultaCpfVotado] = useState([])
  const numeroDeQuestoes = questoes.length
  const navigate = useNavigate()

  const handleOptionSelect = (selectedOption) => {
    const novasOpcoesSelecionadas = [...opcaoSelecionada];
    novasOpcoesSelecionadas[indexQuestaoAtual] = idFuncionarios[selectedOption];
    setOpcaoSelecionada(novasOpcoesSelecionadas);
  }

  const handleNextQuestion = () => {
    if (opcaoSelecionada[indexQuestaoAtual] !== undefined){
      setIndexQuestaoAtual(indexQuestaoAtual + 1)

      const radioButtons = document.querySelectorAll('input[type="radio"]');
      radioButtons.forEach((radio) => {
        radio.checked = false;
      });
    }else {
      toast.error('Escolha uma Opcao', { closeButton: false })
    }
  }

  useEffect(() => { 

    let cpfId = idUser;
    if (cpfId) {
      // Se cpfId estiver definido, realize a consulta.
      const cpfDocRef = doc(db, 'cpfs', cpfId);
      getDoc(cpfDocRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const votado = data.votado;
            setConsultaCpfVotado(votado)
          }
        })
        .catch((error) => {
          toast.error('Erro na consulta ao banco de dados de votante', { closeButton: false })
        });
    } else {
      toast.error('Cpf de Votante nao Inserido', { closeButton: false })
    }

    const qQuestoes = query(collection(db, 'questoes'))
    const unsubscribe = onSnapshot(qQuestoes, (querySnapshot) => {
      let qQuestoesArr = []
      querySnapshot.forEach((doc) => {
        qQuestoesArr.push({...doc.data(), id: doc.id})
      })
      setQuestoes(qQuestoesArr)
    })    
    return () => unsubscribe()
  }, [])
  
  useEffect(() => {
    //para o usuario nao votar nele mesmo
    indiceOculto = idFuncionarios.indexOf(idUser)
  }, [idUser, idFuncionarios])

  useEffect(() => {
    if (funcionarios.length === 0) {//para carregar a lista de funcionarios que sao as alternativas de votacao
      const capturaNomes = async () => {
        await fetchCPFs()
        setFuncionarios([...cpfs.map(cpf => cpf.nome)])
        setIdFuncionarios([...cpfs.map(cpf => cpf.id)])
    }
    capturaNomes()
  }

  }, [cpfs]);

  const objetoStsVotacao = stsVotacao.reduce((resultado, objeto) => {
    return { ...resultado, ...objeto };
  }, {});
  const votacaoLiberada = votacaoAberta
  

  const handleSendFormToBd = async () => {
    const idQuestoesAtualizado = [...questoes.map(questao => questao.id)]
    
    toast.info('Carregando Votos...', { closeButton: false })

    await setIdQuestoes(idQuestoesAtualizado)

    await addDoc(collection(db, 'votos'), {
      idQuestao: idQuestoesAtualizado,
      idCpfVotado: opcaoSelecionada,
      idCpfVotante: idUser,
      numVotacao: objetoStsVotacao.numVotacao
    })

    await updateDoc(doc(db, 'cpfs', idUser), {
      votado: true
    })

    toast.success('Votacao Realizada', { closeButton: false, onClose: () => {navigate('/')}} );
  }

  return (
    <div className={style.container}>
      <ToastContainer position="top-center" autoClose={1000} hideProgressBar={false} />
      <form className={style.form}>
      {indiceOculto > -1 && votacaoLiberada && !consultaCpfVotado ? (
        indexQuestaoAtual < numeroDeQuestoes ? (
          <div>
            <p className={style.questao}>{questoes.length > 0 && questoes[indexQuestaoAtual] && questoes[indexQuestaoAtual].questao}</p>
            {funcionarios.map((funcionario, index) => (
              index !== indiceOculto && (
              <div key={index} className={style.option}>
                <input
                  type="radio"
                  name="opcao"
                  value={index}
                  onChange={() => handleOptionSelect(index)}
                />
                <label>{funcionario}</label>
              </div>
              )
            ))}
            <button type='button' className={style.botao} onClick={handleNextQuestion}> Próxima </button>
          </div>
        ) : ( 
          <>
            <p className={style.question}>Formulário concluído!</p>
            <button type="button" className={style.botao} onClick={handleSendFormToBd}>Concluir</button>
          </>
        )
        ) : (
          <p className={style.buscaIndice}>...Buscando Opções de Voto ou Votacao Fechada ou Você já Votou...</p>
        )}
      </form>
    </div>
  )
}

export default Votar