import React, { useEffect, useState } from 'react';

// Mapeo de tipos en español a inglés para búsquedas
const tipoEsAEn = {
  normal: 'normal',
  fuego: 'fire',
  agua: 'water',
  planta: 'grass',
  eléctrico: 'electric',
  hielo: 'ice',
  lucha: 'fighting',
  veneno: 'poison',
  tierra: 'ground',
  volador: 'flying',
  psíquico: 'psychic',
  bicho: 'bug',
  roca: 'rock',
  fantasma: 'ghost',
  dragón: 'dragon',
  siniestro: 'dark',
  acero: 'steel',
  hada: 'fairy'
};

function PokemonFetcher({ searchName, searchType }) {
  const [pokemonData, setPokemonData] = useState([]);
  const [error, setError] = useState(null);

  // Traduce los tipos al español usando la API
  const traducirTipos = async (types) => {
    const traducciones = await Promise.all(
      types.map(async (tipo) => {
        const res = await fetch(tipo.type.url);
        const data = await res.json();
        const nombreEs = data.names.find((n) => n.language.name === 'es');
        return nombreEs ? nombreEs.name : tipo.type.name;
      })
    );
    return traducciones;
  };

  // Buscar por nombre
  const fetchPokemonByName = async (name) => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      if (!response.ok) throw new Error('⚠️ Pokémon no encontrado.');
      const data = await response.json();
      const tiposTraducidos = await traducirTipos(data.types);
      setPokemonData([{ ...data, tiposTraducidos }]);
      setError(null);
    } catch (err) {
      setPokemonData([]);
      setError(err.message);
    }
  };

  // Buscar por tipo (en español)
  const fetchPokemonByType = async (tipoEs) => {
    const tipoEn = tipoEsAEn[tipoEs.toLowerCase()];
    if (!tipoEn) {
      setPokemonData([]);
      setError('⚠️ Tipo no reconocido. Usa nombres como fuego, agua, planta...');
      return;
    }

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/type/${tipoEn}`);
      if (!response.ok) throw new Error('⚠️ Tipo no encontrado.');
      const data = await response.json();
      const pokemons = data.pokemon.slice(0, 6); // Limitar resultados
      const details = await Promise.all(
        pokemons.map(async (p) => {
          const res = await fetch(p.pokemon.url);
          const pokeData = await res.json();
          const tiposTraducidos = await traducirTipos(pokeData.types);
          return { ...pokeData, tiposTraducidos };
        })
      );
      setPokemonData(details);
      setError(null);
    } catch (err) {
      setPokemonData([]);
      setError(err.message);
    }
  };

  // Mostrar Pokémon aleatorios
  const fetchRandomPokemons = async () => {
    try {
      const promises = Array.from({ length: 4 }, async () => {
        const id = Math.floor(Math.random() * 151) + 1;
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await res.json();
        const tiposTraducidos = await traducirTipos(data.types);
        return { ...data, tiposTraducidos };
      });
      const results = await Promise.all(promises);
      setPokemonData(results);
      setError(null);
    } catch (err) {
      setError('⚠️ Error al cargar Pokémon aleatorios.');
    }
  };

  useEffect(() => {
    if (searchName) {
      fetchPokemonByName(searchName);
    } else if (searchType) {
      fetchPokemonByType(searchType);
    } else {
      fetchRandomPokemons();
    }
  }, [searchName, searchType]);

  return (
    <div className={`pokemon-container ${error ? 'error' : ''}`}>
      {error ? (
        <p>{error}</p>
      ) : (
        <div className="pokemon-list">
          {pokemonData.map((pokemon) => (
            <div key={pokemon.id} className="pokemon-card">
              <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
              <img src={pokemon.sprites.front_default} alt={pokemon.name} />
              <p><strong>Tipo:</strong> {pokemon.tiposTraducidos.join(', ')}</p>
              <p><strong>Altura:</strong> {pokemon.height / 10} m</p>
              <p><strong>Peso:</strong> {pokemon.weight / 10} kg</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PokemonFetcher;