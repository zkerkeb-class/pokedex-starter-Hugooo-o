import axios from 'axios';

const API_URL = 'http://localhost:3000/api';


const pokemonService = {
  getPokemonList: async () => {
    try {
      const response = await axios.get(`${API_URL}/pokemons`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pokemons:', error);
      throw error;
    }
  },

  getOnePokemon: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/pokemons/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pokemon:', error);
      throw error;
    }
  },

  PostNewPokemon: async (pokemonData) => {
    try {
      const response = await axios.post(`${API_URL}/pokemons`, pokemonData);
      return response.data;
    } catch (error) {
      console.error('Error creating pokemon:', error);
      throw error;
    }
  },

  UpdatePokemon: async (id, pokemonData) => {
    try {
      const response = await axios.put(`${API_URL}/pokemons/${id}`, pokemonData);
      return response.data;
    } catch (error) {
      console.error('Error fetching pokemon:', error);
      throw error;
    }
  },

  DeletePokemon: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/pokemons/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pokemon:', error);
      throw error;
    }
  }
};

export default pokemonService;