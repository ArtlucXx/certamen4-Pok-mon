import React, { useState } from 'react';
import PokemonFetcher from './PokemonFetcher';
import './styles.css';

function App() {
  const [nameInput, setNameInput] = useState('');
  const [typeInput, setTypeInput] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState('');

  const handleNameSearch = (e) => {
    e.preventDefault();
    setSearchName(nameInput.trim());
    setSearchType('');
  };

  const handleTypeSearch = (e) => {
    e.preventDefault();
    setSearchType(typeInput.trim().toLowerCase());
    setSearchName('');
  };

  return (
    <>
      {/* 🎥 Fondo animado en video */}
      <video autoPlay muted loop id="background-video">
        <source
          src="https://static.moewalls.com/videos/preview/pikachu-in-the-rain-pokemon-live-wallpaper.mp4"
          type="video/mp4"
        />
        Tu navegador no soporta video HTML5.
      </video>

      {/* 🧱 Contenido principal */}
      <div className="container">
        <h1>Conoce a tus Pokémon</h1>
        <p>¡Explora por nombre o por tipo elemental!</p>

        <form className="search-bar" onSubmit={handleNameSearch}>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <button type="submit">🔍 Nombre</button>
        </form>

        <form className="search-bar" onSubmit={handleTypeSearch}>
          <input
            type="text"
            placeholder="Buscar por tipo (ej. fuego, agua)..."
            value={typeInput}
            onChange={(e) => setTypeInput(e.target.value)}
          />
          <button type="submit">🔍 Tipo</button>
        </form>

        <PokemonFetcher searchName={searchName} searchType={searchType} />
      </div>
    </>
  );
}

export default App;