import { useState } from 'react'
import pokemons from './assets/pokemons'
//import PokemonList from './components/PokemonList/PokemonList'
//import PokemonCard from './components/pokemonCard/Card'
import './App.css'
import PokemonNavigator from './components/pokemonNavigator/PokemonNavigator'
import { pokemonImages } from './assets/imageLibrary'
import PokemonList from './components/pokemonList/pokemonList'

const bulbasaur = pokemons[0]

console.log("🚀 ~ bulbasaur:", bulbasaur)

function App() {
  const [count, setCount] = useState(0)
  // const nom = 'Zakaria'
  return (
    <div>
        
        <PokemonList />
    </div>
  )
}

export default App
