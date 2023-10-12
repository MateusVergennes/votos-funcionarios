import React, { useEffect, useState } from 'react';
import { AiOutlinePlus, AiFillEdit, AiOutlineCheck, AiFillHome } from 'react-icons/ai';
import { GiCancel } from 'react-icons/gi'
import {FaRegTrashAlt, FaLockOpen, FaLock} from 'react-icons/fa'
import {TbCrownOff, TbCrown} from 'react-icons/tb'
import Switch from 'react-switch';
import { Link } from 'react-router-dom';

import { ToastContainer, toast } from 'react-toastify';

import {db} from '../firebase'
import {query, collection, onSnapshot, updateDoc, doc, addDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

const style = {
  container: `bg-slate-100 max-w-[500px] w-full m-auto rounded-md shadow-xl p-4 mb-4`,
  containerVote: `flex justify-between`,
  form: `flex justify-between`,
  input: `border p-2 w-full text-xl`,
  button: `border font-bold p-4 ml-2 bg-purple-500 text-slate-100 hover:bg-purple-600`,
  contagem: `ml-2 border`,
  title: `text-center text-xl p-2`,
  toggleContainer: `flex items-center justify-center`,
  nomes: `flex justify-between bg-slate-200 p-4 my-2 capitalize`,
  buttonIconsGroup: `flex ml-auto`,
  buttonIcons: `text-black ml-6`,
  buttonClose: `border p-4 ml-2 bg-red-500 text-slate-100 hover:bg-red-600`,
  liberaVotos: `border p-4 ml-2 bg-purple-500 text-slate-100 hover:bg-purple-600 flex flex-col items-center text-center`,
  buttonHome: `hover:bg-purple-500 p-2 rounded-full`,
};

const Admin = () => {
  const [cpfs, setCpfs] = useState([])
  const [questoes, setQuestoes] = useState([])
  const [admin, setAdmin] = useState([])
  const [inputNome, setInputNome] = useState('')
  const [inputCpf, setInputCpf] = useState('')
  const [inputQuestoes, setInputQuestoes] = useState('')
  const [editandoCpf, setEditandoCpf] = useState(false)
  const [idCpfEditando, setIdCpfEditando] = useState('')
  const [editandoQuestao, setEditandoQuestao] = useState(false)
  const [idQuestaoEditando, setIdQuestaoEditando] = useState('')

  //Create 
const createVotantes = async (e) => {
  e.preventDefault(e)
  if( (inputNome === '') || (inputCpf === '') ){
    toast.error(`Preencha os Campos corretamente!`, { closeButton: false })
    return
  }
  await addDoc(collection(db, 'cpfs'), {
    nome: inputNome,
    cpf: inputCpf,
    votado: false
  })
  
  setInputNome('')
  setInputCpf('')
  }
  const createQuestoes = async (e) => {
    e.preventDefault(e)
    if(inputQuestoes === ''){
      toast.error(`Preencha o Campo corretamente!`, { closeButton: false })
      return
    }
    await addDoc(collection(db, 'questoes'), {
      questao: inputQuestoes
    })
    
    setInputQuestoes('')
  }


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

  const getAdmin = async () => {
    const q = query(collection(db, 'admin'))
    const unsubscribe = await onSnapshot(q, (querySnapshot) => {
      let adminArr = []
      querySnapshot.forEach((doc) => {
        adminArr.push({...doc.data(), id: doc.id})
      })
      setAdmin(adminArr)
    })
    return () => unsubscribe()
  }


  Promise.all([getCpfs(), getQuestoes(), getAdmin()])
    .then(()=> {
      toast.success('Consulta realizada com Sucesso', { closeButton: false } )
    })
    .catch((error) => {
      toast.error(`erro: ${error}`, { closeButton: false })
    })
  }, [])

  //Delete
  const deleteCpf = async (id) => {
    await deleteDoc(doc(db, 'cpfs', id))
    toast.success('Deletado com Sucesso', {closeButton: false})
  }

  const deleteQuestoes = async (id) => {
    await deleteDoc(doc(db, 'questoes', id))
    toast.success('Deletado com Sucesso', {closeButton: false})
  }

  //Update
  const editCpf = (cpf) => {
    setInputCpf(cpf.cpf)
    setInputNome(cpf.nome)
    setIdCpfEditando(cpf.id)
    setEditandoCpf(true)
  }

  const checkUpdateCpf = async () => {
    await updateDoc(doc(db, 'cpfs', idCpfEditando), {
      cpf: inputCpf,
      nome: inputNome,
    })
    setInputCpf('')
    setInputNome('')
    setEditandoCpf(false)
  }
  
  const editQuestoes = (questao) => {
    setInputQuestoes(questao.questao)
    setIdQuestaoEditando(questao.id)
    setEditandoQuestao(true)
  }

  const checkUpdateQuestoes = async () => {
    await updateDoc(doc(db, 'questoes', idQuestaoEditando), {
      questao: inputQuestoes
    })
    setInputQuestoes('')
    setEditandoQuestao(false)
  }

  const liberaFechaVoto = async (cpf) => {
    await updateDoc(doc(db, 'cpfs', cpf.id), {
      votado: !cpf.votado
    })
  }

  const liberaVotosGeral = async () => {
    cpfs.forEach(async(cpf) => {
      await updateDoc(doc(db, 'cpfs', cpf.id), {
        votado: false
      })
    })
  }
  
  const isVotacaoLiberada = admin.length > 0 ? admin[0].votacaoAberta : false //verifica se admin ja foi obtido do bd, se nao (false) se sim, pega o valor de votacaoAberta

  const toggleVotacao = async () => {
    //setOptionVotacaoAberta((prev) => !prev);
    await updateDoc(doc(db, 'admin', admin[0].id), {
      votacaoAberta: !isVotacaoLiberada
    })
  }

  const atualValorVotacao = admin.length > 0 ? admin[0].numVotacao : 0

  const adicionarVotacao = async () => {
    const novoValorVotacao = atualValorVotacao + 1
    await updateDoc(doc(db, 'admin', admin[0].id), {
      numVotacao: novoValorVotacao
    })
    toast.success('Votacao Adicionada com Sucesso', { closeButton: false } )
  }


  

  const cpfsAdminsArr = admin.map((a) => a.cpfsAdmins).flat()//flat para retirar herancas  de prototype do objeto anterior
  
  const ehAdmin = (cpf) => {
    return cpfsAdminsArr.includes(cpf)
  }

  const tornaAdmin = async (cpf) => {
    const jaEhAdmin = cpfsAdminsArr.includes(cpf.cpf)
    if (jaEhAdmin){
      await updateDoc(doc(db, 'admin', admin[0].id), {
        cpfsAdmins: arrayRemove(cpf.cpf)
      })
    }else{
      await updateDoc(doc(db, 'admin', admin[0].id), {
        cpfsAdmins: arrayUnion(cpf.cpf)
      })
    }
  }

  return (
    <div>
      <ToastContainer position="top-center" autoClose={1000} hideProgressBar={false} />
      <Link to="/">
        <button className={style.buttonHome}><AiFillHome size={30}/></button>
      </Link>
      <div className={style.container}>
        <p className={`${style.title} ${style.buttonAdd}`}>Controle da Votação</p>
        <div className={style.containerVote}>
          <div className={style.toggleContainer}>
            <label htmlFor="toggleSwitch" className="mr-2">
              {isVotacaoLiberada ? 'Aberta' : 'Fechada'}
            </label>
            <Switch
              id="toggleSwitch"
              checked={isVotacaoLiberada}
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
          <button className={style.liberaVotos} onClick={() => liberaVotosGeral()}>
            <FaLockOpen />
            <p>Todos</p>        
          </button>
          <button className={style.button} onClick={adicionarVotacao}>Adicionar Votação <p className={style.contagem}>Votação Atual: {atualValorVotacao}</p></button>
        </div>
      </div>      
      <div className={style.container}>
        <p className={style.title}>Adicione Votantes</p>
        <form className={style.form} onSubmit={(e) => e.preventDefault(e)}>
          <input className={style.input} value={inputNome} type="text" placeholder='Insira o Nome' onChange={(e) => setInputNome(e.target.value)}></input>
          <input className={style.input} value={inputCpf} type="text" placeholder='Insira o CPF' onChange={(e) => setInputCpf(e.target.value)}></input>
          {editandoCpf 
            ? <div className='flex flex-col items-end'>
                <button className={style.buttonClose} onClick={(e) => {setEditandoCpf(false) 
                                                                      setInputCpf('') 
                                                                      setInputNome('')}}><GiCancel size={30} /></button>
                <button className={style.button} onClick={checkUpdateCpf}><AiOutlineCheck size={30} /></button>
              </div>
            : <button className={style.button} onClick={createVotantes}><AiOutlinePlus size={30} /></button>
          }
          
        </form>
        {cpfs.map((cpf, index) => (
          <div key={index}>
            <div className={style.nomes}>{cpf.nome}
              <div className={style.buttonIconsGroup}>
                <button className={style.buttonIcons} onClick={() => tornaAdmin(cpf)}>{ehAdmin(cpf.cpf) ? <TbCrown /> : <TbCrownOff />}</button>
                <button className={style.buttonIcons} onClick={() => liberaFechaVoto(cpf)}>{cpf.votado ? <FaLock /> : <FaLockOpen />}</button>
                <button className={style.buttonIcons} onClick={() => editCpf(cpf)}>{<AiFillEdit />}</button>
                <button className={style.buttonIcons} onClick={() => deleteCpf(cpf.id)}>{<FaRegTrashAlt />}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={style.container}>
        <p className={style.title}>Adicione Questões</p>
        <form className={style.form} onSubmit={(e) => e.preventDefault(e)}>
          <input className={style.input} value={inputQuestoes} type="text" placeholder='Adicione a Nova Questão' onChange={(e) => setInputQuestoes(e.target.value)}></input>
          {editandoQuestao
            ? <div className="flex flex-col items-end">
                <button className={style.buttonClose} onClick={(e) => {setEditandoQuestao(false) 
                                                                      setInputQuestoes('') }}><GiCancel size={30} /></button>
                <button className={style.button} onClick={checkUpdateQuestoes}><AiOutlineCheck size={30} /></button>
              </div>
            : <button className={style.button} onClick={createQuestoes}><AiOutlinePlus size={30} /></button>
          }
        </form>
        {questoes.map((questao, index) => (
          <div key={index}>
            <div key={index} className={style.nomes}>{questao.questao}
              <div className={style.buttonIconsGroup}>
                <button className={style.buttonIcons} onClick={() => editQuestoes(questao)}>{<AiFillEdit />}</button>
                <button className={style.buttonIcons} onClick={() => deleteQuestoes(questao.id)}>{<FaRegTrashAlt />}</button>
              </div> 
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Admin;
