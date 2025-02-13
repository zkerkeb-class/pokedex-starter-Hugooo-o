import { useState } from 'react'
//import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import pokemons from '../../assets/pokemons'
console.log("🚀 ~ pokemons:", pokemons)
import './Card.css'
//import Header from './components/header'
const charizard = pokemons[5]
console.log("🚀 ~ charizard:", charizard)
console.log("🚀 ~ charizard:", charizard.type[0])
console.log("🚀 ~ charizard:", charizard.name.japanese)


function App() {
  const [count, setCount] = useState(0)
  return (
    <>
        <div className='carte'>
            <div className='head'>
                <p className='name'>{charizard.name.english}</p>
                <p className='HP'>{charizard.base.HP}</p>
                <p className='PV'>PV</p>
                <p className='type'>{charizard.type[0]}</p>
                
            </div>
            
            <div className="illus">
                <img src={charizard.image} /*className="logo react"*/ alt="React logo" />
            </div>

            <div className="corps">
                <p className="nstat">Attack : </p>
                <p className="stat">{charizard.base.Attack}</p>
                <p className="nstat">Defense : </p>
                <p className="stat">{charizard.base.Defense}</p>
                <p className="nstat">Sp. Attack : </p>
                <p className="stat">{charizard.base['Sp. Attack']}</p>
                <p className="nstat">Sp. Defense : </p>
                <p className="stat">{charizard.base['Sp. Defense']}</p>
            </div>
        </div>
    </>
  )
}

export default App