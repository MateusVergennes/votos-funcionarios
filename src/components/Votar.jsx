import React, { useEffect, useState } from 'react'

import { ToastContainer, toast } from 'react-toastify';

import {query, collection, onSnapshot} from 'firebase/firestore'
import {db} from '../firebase'

const style ={
  container: `bg-slate-100 max-w-[600px] w-full m-auto rounded-md shadow-xl p-4`,
  form: `flex flex-col h-full justify-between`,
  botao: `bg-blue-500 text-white font-semibold py-2 rounded-md mt-4`,
  questao:`text-xl font-bold mb-2`,
  option: 'mb-2',
}

const Votar = ({cpfs, fetchCPFs}) => {
  const [indexQuestaoAtual, setIndexQuestaoAtual] = useState(0)
  const [opcaoSelecionada, setOpcaoSelecionada] = useState([])
  const [funcionarios, setFuncionarios] = useState([])
  const [questoes, setQuestoes] = useState([])
  const numeroDeQuestoes = questoes.length

  const handleOptionSelect = (selectedOption) => {
    const novasOpcoesSelecionadas = [...opcaoSelecionada];
    novasOpcoesSelecionadas[indexQuestaoAtual] = selectedOption;
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
      toast.error('Escolha uma Opcao', { closeButton: false });
    }
  }

  useEffect(() => {
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
    if (funcionarios.length === 0) {//para carregar a lista de funcionarios que sao as alternativas de votacao
      const capturaNomes = async () => {
        await fetchCPFs()
        setFuncionarios([...cpfs.map(cpf => cpf.nome)])
    }
    capturaNomes()
  }

  }, [cpfs]);

  return (
    <div className={style.container}>
      <ToastContainer position="top-center" autoClose={1000} hideProgressBar={false} />
      <form className={style.form}>
        {indexQuestaoAtual < numeroDeQuestoes ? (
          <div>
            <p className={style.questao}>{questoes.length > 0 && questoes[indexQuestaoAtual] && questoes[indexQuestaoAtual].questao}</p>
            {funcionarios.map((funcionario, index) => (
              <div key={index} className={style.option}>
                <input
                  type="radio"
                  name="opcao"
                  value={index}
                  onChange={() => handleOptionSelect(index)}
                />
                <label>{funcionario}</label>
              </div>
            ))}
            <button type='button' className={style.botao} onClick={handleNextQuestion}> Próxima </button>
          </div>
        ) : ( 
          <>
            <p className={style.question}>Formulário concluído!</p>
            <button type="button" className={style.botao}>Concluir</button>
          </>
        )}
      </form>
    </div>
  )
}

export default Votar