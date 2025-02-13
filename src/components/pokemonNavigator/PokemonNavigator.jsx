import { useState } from 'react'
import pokemons from '../../assets/pokemons'
import PokemonCard from '../pokemonCard/Card'

const PokemonNavigator = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % pokemons.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + pokemons.length) % pokemons.length)
  }

  const currentPokemon = pokemons[currentIndex]

  return (
    <div>
      <PokemonCard 
        name={currentPokemon.name.french}
        types={currentPokemon.type} 
        image={currentPokemon.image}
        attack={currentPokemon.base.Attack}
        defense={currentPokemon.base.Defense}
        hp={currentPokemon.base.HP}
      />
      <button onClick={handlePrev}>Previous</button>
      <button onClick={handleNext}>Next</button>
    </div>
  )
}

export default PokemonNavigator