import React, { useEffect, useState } from 'react';

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

  const traducirTipos = async (types) => {
    const traducciones = await Promise.all(
      types.map(async (tipo) => {
        try {
          const res = await fetch(tipo.type.url);
          const data = await res.json();
          const nombreEs = data.names.find((n) => n.language.name === 'es');
          return nombreEs ? nombreEs.name : tipo.type.name;
        } catch {
          return tipo.type.name;
        }
      })
    );
    return traducciones;
  };

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
      const pokemons = data.pokemon;
      const details = await Promise.allSettled(
        pokemons.map(async (p) => {
          try {
            const res = await fetch(p.pokemon.url);
            const pokeData = await res.json();
            if (!pokeData.sprites?.front_default) return null;
            const tiposTraducidos = await traducirTipos(pokeData.types);
            return { ...pokeData, tiposTraducidos };
          } catch {
            return null;
          }
        })
      );
      const filtrados = details
        .filter((r) => r.status === 'fulfilled' && r.value)
        .map((r) => r.value);
      setPokemonData(filtrados);
      setError(null);
    } catch (err) {
      setPokemonData([]);
      setError(err.message);
    }
  };

  const fetchAllPokemons = async () => {
    try {
      const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
      const data = await res.json();

      const detalles = await Promise.allSettled(
        data.results.map(async (pokemon) => {
          try {
            const resPokemon = await fetch(pokemon.url);
            const detalle = await resPokemon.json();
            if (!detalle.sprites?.front_default) return null;
            const tiposTraducidos = await traducirTipos(detalle.types);
            return { ...detalle, tiposTraducidos };
          } catch {
            return null;
          }
        })
      );

      const filtrados = detalles
        .filter((r) => r.status === 'fulfilled' && r.value)
        .map((r) => r.value);

      setPokemonData(filtrados);
      setError(null);
    } catch (err) {
      setError('⚠️ Error grave al cargar todos los Pokémon.');
    }
  };

  useEffect(() => {
    if (searchName) {
      fetchPokemonByName(searchName);
    } else if (searchType) {
      fetchPokemonByType(searchType);
    } else {
      fetchAllPokemons();
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