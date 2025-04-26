import { useState,useEffect } from "react"
import "./Card.css"

const PokemonCard = ({name, types = [], image, attack, defense, hp}) => {
    const [currentHP, setCurrentHP] = useState(hp)
    console.log("types = ", {types})
    /*useEffect(() => {
        alert("le combat commence")
    
    }, [])

    useEffect(() => {
            console.log('currentHP useEffect', currentHP)
        if (currentHP <= 0) {
           alert("bulbizarre est mort")
        }
    }, [currentHP])*/

    const handleAttack = () => {
        console.log("bulbizarre ce mange une patate")
        setCurrentHP(currentHP - 10)
    }
 
    return (
        <div>
            <h1>{name}</h1>
            <img src={image} alt={name} />
            {Array.isArray(types) && types.map((type) => {
                return (
                    <p key={type}> {type} </p>
                )
            })}
            <p>Attack: {attack}</p>
            <p>Defense: {defense}</p>
            <p>HP: {currentHP}</p>
            <button onClick={handleAttack}>Attack</button>

        </div>
    )
}

export default PokemonCard