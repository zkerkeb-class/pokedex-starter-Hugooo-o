import { createBrowserRouter } from 'react-router';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import PokemonList from '../components/pokemonList/PokemonList';
import PokemonDetail from '../components/pokemonDetail/PokemonDetail';
import PokemonEdit from '../components/pokemonEdit/pokemonEdit';
import PokemonCreate from '../components/PokemonCreate/PokemonCreate';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminRoute from '../components/common/AdminRoute';
import MyPokemons from '../components/myPokemons/MyPokemons';
import Booster from '../components/Booster/Booster';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <PokemonList />
          </ProtectedRoute>
        )
      },
      {
        path: '/pokemon/create',
        element: (
          <AdminRoute>
            <PokemonCreate />
          </AdminRoute>
        )
      },
      {
        path: '/pokemon/:id',
        element: (
          <ProtectedRoute>
            <PokemonDetail />
          </ProtectedRoute>
        )
      },
      {
        path: '/pokemon/:id/edit',
        element: (
          <AdminRoute>
            <PokemonEdit />
          </AdminRoute>
        )
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/register',
        element: <Register />
      },
      {
        path: '/my-pokemons',
        element: (
          <ProtectedRoute>
            <MyPokemons />
          </ProtectedRoute>
        )
      },
      {
        path: '/booster',
        element: (
          <ProtectedRoute>
            <Booster />
          </ProtectedRoute>
        )
      },
      {
        path: '*',
        element: <div>404 - Page not found</div>
      }
    ]
  }
]);