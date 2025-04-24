import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const pokemonService = {
  getPokemonList: async () => {
    try {
      console.log('Fetching all pokemons from API...');
      const response = await axios.get(`${API_URL}/pokemons`);
      console.log(`API response received with ${response.data.length} pokemons`);
      
      // Si la réponse est un tableau, on le transforme directement
      const pokemons = Array.isArray(response.data) ? response.data.map(pokemon => ({
        ...pokemon,
        id: pokemon.id || 0, 
        _id: undefined
      })) : [];
      
      console.log(`Processed ${pokemons.length} pokemons`);
      return { pokemons };
    } catch (error) {
      console.error('Error fetching pokemons:', error);
      throw error;
    }
  },

  getOnePokemon: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/pokemons/${id}`);
      const pokemon = {
        ...response.data,
        id: response.data.idNumber || response.data.id,
        mongoId: response.data._id,
        _id: undefined
      };
      return { pokemon };
    } catch (error) {
      console.error('Error fetching pokemon:', error);
      throw error;
    }
  },

  PostNewPokemon: async (pokemonData) => {
    try {
      // Envoyez les données telles quelles à MongoDB
      const response = await axios.post(`${API_URL}/pokemons`, pokemonData);
      return response.data;
    } catch (error) {
      console.error('Error creating pokemon:', error);
      throw error;
    }
  },

  UpdatePokemon: async (id, pokemonData) => {
    try {
      // Préparation des données pour MongoDB
      const dataToSend = {
        ...pokemonData,
        idNumber: pokemonData.id,
        _id: undefined
      };
      
      const response = await axios.put(`${API_URL}/pokemons/${id}`, dataToSend);
      console.log('MongoDB response:', response.data);
      
      // Exactement la même transformation que getOnePokemon
      const pokemon = {
        ...response.data,
        id: response.data.idNumber || response.data.id,
        mongoId: response.data._id,
        _id: undefined
      };
      
      console.log('Transformed pokemon:', pokemon);
      return { pokemon };  // Même format que getOnePokemon
    } catch (error) {
      console.error('Error updating pokemon:', error);
      throw error;
    }
  },

  DeletePokemon: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/pokemons/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting pokemon:', error);
      throw error;
    }
  },

  // Nouvelle fonction pour ajouter des pokémons à la collection de l'utilisateur
  addPokemonsToCollection: async (pokemons) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Vous devez être connecté pour ajouter des pokémons à votre collection");
      }

      // Ajouter un identifiant unique pour chaque carte, même si c'est le même pokémon
      // Cela permettra d'avoir des doublons dans la collection
      const timestampedPokemons = pokemons.map(pokemon => ({
        ...pokemon,
        collectionId: `${pokemon.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        addedAt: new Date().toISOString()
      }));

      const response = await axios.post(
        `${API_URL}/auth/add-pokemons`, 
        { pokemons: timestampedPokemons }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Pokémons ajoutés à la collection avec IDs uniques:", timestampedPokemons);

      // Mise à jour du localStorage également
      try {
        const existingCollection = JSON.parse(localStorage.getItem('userPokemons')) || [];
        localStorage.setItem('userPokemons', JSON.stringify([...existingCollection, ...timestampedPokemons]));
      } catch (localError) {
        console.warn("Échec de la mise à jour du localStorage:", localError);
      }

      return response.data;
    } catch (error) {
      console.error('Error adding pokemons to collection:', error);
      throw error;
    }
  },

  // Fonction pour récupérer les pokémons de l'utilisateur
  getUserPokemons: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Vous devez être connecté pour voir votre collection");
      }
      
      const response = await axios.get(
        `${API_URL}/auth/my-pokemons`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user pokemons:', error);
      throw error;
    }
  }
};

export default pokemonService;