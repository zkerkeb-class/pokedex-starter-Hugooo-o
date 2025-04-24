import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import pokemonService from '../services/pokemonService';
import { collectionUpdateEvent } from '../myPokemons/MyPokemons';
import Memory from '../games/Memory';
import './Booster.css';

const Booster = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPokemons, setAllPokemons] = useState([]);
  const [selectedPokemons, setSelectedPokemons] = useState([]);
  const [boosterOpened, setBoosterOpened] = useState(false);
  const [revealedCards, setRevealedCards] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [savingCollection, setSavingCollection] = useState(false);
  const [showMemoryGame, setShowMemoryGame] = useState(false);
  const [memoryGameWon, setMemoryGameWon] = useState(false);

  // Récupérer la liste complète des pokémons au chargement
  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const response = await pokemonService.getPokemonList();
        if (response && response.pokemons) {
          setAllPokemons(response.pokemons);
        } else {
          setError("Impossible de charger les pokémons");
        }
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des pokémons:", err);
        setError("Erreur lors du chargement des pokémons");
        setLoading(false);
      }
    };

    fetchPokemons();
  }, []);

  // Fonction pour sélectionner aléatoirement 5 pokémons
  const selectRandomPokemons = () => {
    if (allPokemons.length === 0) return;

    // Copie et mélange du tableau de pokémons
    const shuffled = [...allPokemons].sort(() => 0.5 - Math.random());
    
    // Sélection des 5 premiers
    const selected = shuffled.slice(0, 5);
    
    setSelectedPokemons(selected);
    setBoosterOpened(true);
    
    // Timer pour l'animation des cartes
    let count = 0;
    const revealInterval = setInterval(() => {
      count++;
      setRevealedCards(count);
      
      if (count >= 5) {
        clearInterval(revealInterval);
        
        // Attendre la fin de l'animation avant de considérer que tout est terminé
        setTimeout(() => {
          setAnimationComplete(true);
        }, 1000);
        
        // Ajouter les pokémons à la collection de l'utilisateur
        addPokemonsToCollection(selected);
      }
    }, 800);
  };

  // Fonction pour ajouter les pokémons à la collection de l'utilisateur
  const addPokemonsToCollection = async (pokemons) => {
    try {
      setSavingCollection(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Vous devez être connecté pour ouvrir un booster");
        setSavingCollection(false);
        return;
      }
      
      // Utiliser notre service pour ajouter les pokémons à la collection
      // Les doublons sont maintenant gérés par le service pokemonService
      const response = await pokemonService.addPokemonsToCollection(pokemons);
      console.log("Pokémons ajoutés à la collection:", response);
      
      // Émettre un événement pour notifier que la collection a été mise à jour
      collectionUpdateEvent.dispatchEvent(new CustomEvent('collectionUpdate', {
        detail: { pokemons: pokemons }
      }));
      
      setSavingCollection(false);
    } catch (err) {
      console.error("Erreur lors de l'ajout des pokémons à la collection:", err);
      setError("Erreur lors de l'ajout des pokémons à votre collection");
      setSavingCollection(false);
    }
  };

  // Fonction pour revenir à la page Mes Pokémons
  const handleBackToCollection = () => {
    navigate('/my-pokemons');
  };

  // Fonction pour ouvrir un nouveau booster
  const handleOpenNewBooster = () => {
    setBoosterOpened(false);
    setRevealedCards(0);
    setSelectedPokemons([]);
    setAnimationComplete(false);
    setMemoryGameWon(false);
  };

  // Fonction pour commencer le jeu Memory
  const handleStartMemoryGame = () => {
    setShowMemoryGame(true);
  };

  // Fonction appelée lorsque le joueur gagne au Memory
  const handleMemoryGameWon = () => {
    setMemoryGameWon(true);
    setShowMemoryGame(false);
  };

  // Fonction appelée lorsque le joueur perd au Memory
  const handleMemoryGameLost = () => {
    setShowMemoryGame(false);
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="booster-container">
      <h1>Booster Pokémon</h1>
      
      {showMemoryGame ? (
        <Memory 
          onWin={handleMemoryGameWon} 
          onLose={handleMemoryGameLost}
          difficulty="easy"
        />
      ) : !boosterOpened ? (
        <div className="booster-pack-container">
          {memoryGameWon ? (
            <div className="booster-pack" onClick={selectRandomPokemons}>
              <img 
                src="/assets/booster-pack.png" 
                alt="Booster Pack" 
                className="booster-image"
              />
              <div className="booster-instruction">Félicitations ! Vous avez gagné au Memory. Cliquez pour ouvrir votre booster et obtenir 5 cartes Pokémon !</div>
            </div>
          ) : (
            <div className="booster-unlock-container">
              <img 
                src="/assets/booster-pack.png" 
                alt="Booster Pack" 
                className="booster-image locked"
              />
              <div className="booster-instruction">
                Vous devez d'abord gagner au jeu Memory pour débloquer ce booster !
              </div>
              <button onClick={handleStartMemoryGame} className="memory-button">
                Jouer au Memory
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="cards-container">
          {selectedPokemons.map((pokemon, index) => (
            <div 
              key={index} 
              className={`pokemon-card ${index < revealedCards ? 'revealed' : ''}`}
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <div className="card-inner">
                <div className="card-front">
                  <img src="/assets/card-back.png" alt="Card Back" />
                </div>
                <div className="card-back">
                  <h3>{pokemon.name.french}</h3>
                  <img src={pokemon.image} alt={pokemon.name.french} />
                  <div className="pokemon-types">
                    {pokemon.type.map((type) => (
                      <span key={type} className="pokemon-type">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {savingCollection && (
            <div className="saving-message">
              Enregistrement des pokémons dans votre collection...
            </div>
          )}
          
          {animationComplete && !savingCollection && (
            <div className="booster-actions">
              <button onClick={handleOpenNewBooster} className="booster-button">Ouvrir un nouveau booster</button>
              <button onClick={handleBackToCollection} className="booster-button">Voir ma collection</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Booster; 