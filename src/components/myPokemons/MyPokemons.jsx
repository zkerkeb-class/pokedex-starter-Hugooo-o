import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { imageType } from '../../assets/imageType';
import pokemonService from '../services/pokemonService';
import './MyPokemons.css';

// Créer notre propre système d'événements pour éviter les problèmes d'importation
const collectionUpdateEvent = new EventTarget();

// Exporter l'événement pour que Booster.jsx puisse l'utiliser
export { collectionUpdateEvent };

const MyPokemons = () => {
    const [pokemons, setPokemons] = useState([]);
    const [uniquePokemons, setUniquePokemons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pokemonCounts, setPokemonCounts] = useState({});
    const navigate = useNavigate();

    const fetchUserPokemons = async () => {
        try {
            setLoading(true);
            
            try {
                // Utiliser notre service pour récupérer les pokémons de l'utilisateur
                const userPokemons = await pokemonService.getUserPokemons();
                console.log("Pokémons récupérés depuis l'API:", userPokemons);
                setPokemons(userPokemons);
                
                // Utiliser les compteurs provenant de l'API si disponibles
                // Sinon, recalculer localement
                const counts = {};
                if (userPokemons.length > 0 && userPokemons[0].count) {
                    // Utiliser les compteurs déjà calculés par l'API
                    userPokemons.forEach(pokemon => {
                        if (pokemon.id && pokemon.count) {
                            counts[pokemon.id] = pokemon.count;
                        } else if (pokemon.id) {
                            counts[pokemon.id] = (counts[pokemon.id] || 0) + 1;
                        }
                    });
                } else {
                    // Calculer localement les compteurs (ancien système)
                    userPokemons.forEach(pokemon => {
                        if (pokemon.id) {
                            counts[pokemon.id] = (counts[pokemon.id] || 0) + 1;
                        }
                    });
                }
                
                setPokemonCounts(counts);
                console.log("Compteurs de Pokémons:", counts);
                
                // Créer une liste de Pokémons uniques (un seul exemplaire par Pokémon)
                const uniquePokemonMap = new Map();
                userPokemons.forEach(pokemon => {
                    if (pokemon.id && !uniquePokemonMap.has(pokemon.id)) {
                        uniquePokemonMap.set(pokemon.id, pokemon);
                    }
                });
                
                const uniquePokemonList = Array.from(uniquePokemonMap.values());
                console.log("Pokémons uniques:", uniquePokemonList.length);
                setUniquePokemons(uniquePokemonList);
                
            } catch (apiError) {
                console.error('Erreur API:', apiError);
                
                // Si l'API échoue, utiliser le localStorage comme solution de secours
                console.warn("Utilisation du localStorage comme solution de secours");
                const localPokemons = JSON.parse(localStorage.getItem('userPokemons')) || [];
                setPokemons(localPokemons);
                
                // Calculer les compteurs depuis le localStorage
                const counts = {};
                const uniquePokemonMap = new Map();
                
                localPokemons.forEach(pokemon => {
                    if (pokemon.id) {
                        counts[pokemon.id] = (counts[pokemon.id] || 0) + 1;
                        
                        // Ajouter le Pokémon à la carte des Pokémons uniques
                        if (!uniquePokemonMap.has(pokemon.id)) {
                            uniquePokemonMap.set(pokemon.id, pokemon);
                        }
                    }
                });
                
                setPokemonCounts(counts);
                setUniquePokemons(Array.from(uniquePokemonMap.values()));
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors de la récupération des pokémons:', error);
            setError('Erreur lors du chargement de votre collection');
            setLoading(false);
        }
    };

    // Chargement initial des Pokémons
    useEffect(() => {
        fetchUserPokemons();
    }, []);

    // Écouter les mises à jour de la collection
    useEffect(() => {
        const handleCollectionUpdate = (event) => {
            console.log("Événement de mise à jour de la collection reçu", event.detail);
            // Rafraîchir la collection pour récupérer les nouveaux Pokémons
            fetchUserPokemons();
        };

        // S'abonner à l'événement
        collectionUpdateEvent.addEventListener('collectionUpdate', handleCollectionUpdate);

        // Se désabonner lorsque le composant est démonté
        return () => {
            collectionUpdateEvent.removeEventListener('collectionUpdate', handleCollectionUpdate);
        };
    }, []);

    const handleOpenBooster = () => {
        navigate('/booster');
    };

    // Fonction pour rafraîchir la collection
    const refreshCollection = async () => {
        await fetchUserPokemons();
    };

    if (loading) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="my-pokemons-container">
            <div className="my-pokemons-header">
                <h1>Ma Collection de Pokémons</h1>
                <div className="my-pokemons-actions">
                    <button onClick={refreshCollection} className="refresh-button">
                        Rafraîchir
                    </button>
                    <button onClick={handleOpenBooster} className="booster-button">
                        Ouvrir un Booster
                    </button>
                </div>
            </div>
            
            {uniquePokemons.length === 0 ? (
                <div className="empty-collection">
                    <p>Vous n'avez pas encore de Pokémon dans votre collection.</p>
                    <p>Cliquez sur "Ouvrir un Booster" pour obtenir vos premiers Pokémons !</p>
                </div>
            ) : (
                <div className="pokemon-collection">
                    {uniquePokemons.map((pokemon) => (
                        <div 
                            key={`unique-${pokemon.id}`} 
                            className="collection-card"
                            title={`Vous avez ${pokemonCounts[pokemon.id]} exemplaire(s) de ce Pokémon`}
                        >
                            {pokemon.id && pokemonCounts[pokemon.id] > 0 && (
                                <div className="pokemon-count">
                                    x{pokemonCounts[pokemon.id]}
                                </div>
                            )}
                            <h3>{pokemon.name?.french || 'Pokémon'}</h3>
                            <img 
                                src={pokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`} 
                                alt={pokemon.name?.french || 'Pokémon'} 
                            />
                            <div className="pokemon-types">
                                {pokemon.type && pokemon.type.map((type) => (
                                    <span key={type} className="pokemon-type">
                                        {imageType && imageType[type] ? (
                                            <img src={imageType[type]} alt={type} className="type-icon"/>
                                        ) : (
                                            type
                                        )}
                                    </span>
                                ))}
                            </div>
                            <div className="pokemon-stats">
                                <div className="pokemon-stat">
                                    <span>HP:</span>
                                    <span>{pokemon.base?.HP || 0}</span>
                                </div>
                                <div className="pokemon-stat">
                                    <span>ATK:</span>
                                    <span>{pokemon.base?.Attack || 0}</span>
                                </div>
                                <div className="pokemon-stat">
                                    <span>DEF:</span>
                                    <span>{pokemon.base?.Defense || 0}</span>
                                </div>
                                <div className="pokemon-stat">
                                    <span>SP.ATK:</span>
                                    <span>{pokemon.base?.['Sp. Attack'] || pokemon.base?.SpecialAttack || 0}</span>
                                </div>
                                <div className="pokemon-stat">
                                    <span>SP.DEF:</span>
                                    <span>{pokemon.base?.['Sp. Defense'] || pokemon.base?.SpecialDefense || 0}</span>
                                </div>
                                <div className="pokemon-stat">
                                    <span>SPD:</span>
                                    <span>{pokemon.base?.Speed || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPokemons;
