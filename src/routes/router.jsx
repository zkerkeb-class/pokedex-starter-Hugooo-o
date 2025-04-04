import { createBrowserRouter } from 'react-router';
import PokemonList from '../components/pokemonList/pokemonList';
import PokemonDetail from '../components/pokemonDetail/pokemonDetail';
import PokemonEdit from '../components/pokemonEdit/pokemonEdit';
import PokemonCreate from '../components/PokemonCreate/PokemonCreate';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PokemonList />,
  },
  {
    path: "/pokemon/:id",
    element: <PokemonDetail />,
  },
  {
    path: "/pokemon/:id/edit",
    element: <PokemonEdit />,
  },
  {
    path: "/pokemon/create",
    element: <PokemonCreate />,
  }
]);