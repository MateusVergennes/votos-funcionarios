import React from 'react'

const style = {
  container: `bg-slate-100 max-w-[700px] w-full m-auto rounded-md shadow-xl p-4 mb-4`,
  title: `text-2xl font-bold mb-4 text-center`,
  defFuncMes: `text-lg font-semibold mb-2`,
  funcMes: `text-xl font-bold`,
  barraProgresso: `poll__option-fill w-1/2 h-2 bg-gray-300`,
}

const Resultados = () => {
  return (
    <div>
      <div className={style.container}>
        <p className={style.title}>Resultados das Votações de Funcionário do Mês</p>
          <h2 className={style.defFuncMes}>O Funcionário do Mês é: </h2>
            <h1 className={style.funcMes}>Kleber</h1>
      </div>
      <div className={style.container}>
        <p className={style.title}>Resultados Gerais das Votações de Funcionário do Mês</p>
          <p className={style.barraProgresso}></p>
          <p className={style.listFuncionarios}>Kleber</p>
      </div>
    </div>
  )
}

export default Resultados