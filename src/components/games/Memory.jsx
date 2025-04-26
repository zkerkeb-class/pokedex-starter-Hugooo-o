import React, { useState, useEffect, useRef } from 'react';
import './Memory.css';
import { pokemonImages } from '../../assets/imageLibrary';

// Images de dos de carte
const CARD_BACK = '/favicon.png';

const Memory = ({ onWin, onLose, difficulty: initialDifficulty = 'normal' }) => {
  // Difficulté : Facile (4x2), Normal (4x3), Difficile (4x4)
  const difficultySettings = {
    easy: { rows: 2, cols: 4, maxAttempts: 6, label: 'Facile' },
    normal: { rows: 3, cols: 4, maxAttempts: 12, label: 'Normal' },
    hard: { rows: 4, cols: 4, maxAttempts: 18, label: 'Difficile' }
  };

  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [showDifficultySelector, setShowDifficultySelector] = useState(true);
  const { rows, cols, maxAttempts } = difficultySettings[difficulty] || difficultySettings.normal;
  
  // Liste des IDs Pokémon disponibles (1-151)
  const pokemonIds = Array.from({ length: 151 }, (_, i) => i + 1);

  // Générer des paires aléatoires de Pokémon
  const generateCards = () => {
    // Sélectionner aléatoirement des Pokémon uniques pour les paires
    const shuffledIds = [...pokemonIds].sort(() => 0.5 - Math.random());
    const selectedIds = shuffledIds.slice(0, (rows * cols) / 2);
    
    // Créer les paires
    const pairs = [...selectedIds, ...selectedIds];
    
    // Mélanger les cartes
    return pairs
      .sort(() => 0.5 - Math.random())
      .map((pokemonId, index) => ({
        id: index,
        pokemonId,
        flipped: false,
        matched: false
      }));
  };

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Sélectionner une difficulté
  const selectDifficulty = (diff) => {
    setSelectedDifficulty(diff);
  };

  // Commencer le jeu avec la difficulté sélectionnée
  const startGame = () => {
    if (selectedDifficulty) {
      setDifficulty(selectedDifficulty);
      setShowDifficultySelector(false);
      setCountdown(3);
    }
  };

  // Initialiser le jeu
  useEffect(() => {
    if (!showDifficultySelector && countdown === 0) {
      setCards(generateCards());
      setGameStarted(true);
    }
  }, [countdown, showDifficultySelector, rows, cols]);

  // Commencer le compte à rebours
  useEffect(() => {
    if (showDifficultySelector) return;
    
    const timer = 
      countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, showDifficultySelector]);

  // Vérifier la fin du jeu
  useEffect(() => {
    // Condition de victoire : toutes les cartes sont matchées
    if (matched.length === rows * cols && gameStarted) {
      setGameOver(true);
      setTimeout(() => onWin(), 1000);
    }
    
    // Condition de défaite : nombre maximum de tentatives atteint
    if (attempts >= maxAttempts && gameStarted && matched.length !== rows * cols) {
      setGameOver(true);
      setTimeout(() => onLose(), 1000);
    }
  }, [matched, attempts, gameStarted, maxAttempts, rows, cols, onWin, onLose]);

  // Vérifier les paires après le retournement de 2 cartes
  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      
      // Incrémenté uniquement lorsque deux cartes sont retournées
      setAttempts(prev => prev + 1);
      
      if (cards[first].pokemonId === cards[second].pokemonId) {
        // Paire trouvée
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        // Pas de correspondance, retourner les cartes après un délai
        const timer = setTimeout(() => {
          setFlipped([]);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [flipped, cards, matched]);

  // Gestion du clic sur une carte
  const handleCardClick = (index) => {
    // Ignorer le clic si la carte est déjà retournée ou fait partie d'une paire trouvée
    if (flipped.includes(index) || matched.includes(index) || flipped.length >= 2 || gameOver) {
      return;
    }
    
    setFlipped([...flipped, index]);
  };

  // Redémarrer le jeu
  const restartGame = () => {
    setShowDifficultySelector(true);
    setSelectedDifficulty(null);
    setFlipped([]);
    setMatched([]);
    setAttempts(0);
    setGameOver(false);
    setGameStarted(false);
  };

  // Afficher le sélecteur de difficulté
  if (showDifficultySelector) {
    return (
      <div className="memory-container">
        <div className="difficulty-selector">
          <h2>Choisissez la difficulté</h2>
          <div className="difficulty-buttons">
            {Object.entries(difficultySettings).map(([key, { label }]) => (
              <button 
                key={key} 
                className={`difficulty-button ${selectedDifficulty === key ? 'selected' : ''}`} 
                onClick={() => selectDifficulty(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <button 
            className="start-game-button" 
            onClick={startGame}
            disabled={!selectedDifficulty}
          >
            Sélectionner cette difficulté
          </button>
        </div>
      </div>
    );
  }

  if (countdown > 0) {
    return (
      <div className="memory-container">
        <div className="memory-countdown">
          <h2>Le jeu commence dans</h2>
          <div className="countdown-number">{countdown}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="memory-container">
      <div className="memory-header">
        <div className="memory-info">
          <span>Tentatives: {attempts}/{maxAttempts}</span>
          <span>Paires trouvées: {matched.length / 2}/{(rows * cols) / 2}</span>
          <span>Difficulté: {difficultySettings[difficulty].label}</span>
        </div>
        <button className="memory-restart" onClick={restartGame}>
          Recommencer
        </button>
      </div>
      
      <div 
        className="memory-grid" 
        style={{ 
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            className={`memory-card ${flipped.includes(index) || matched.includes(index) ? 'flipped' : ''} ${matched.includes(index) ? 'matched' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="memory-card-inner">
              <div className="memory-card-front">
                <img src={CARD_BACK} alt="Card back" />
              </div>
              <div className="memory-card-back">
                {card && pokemonImages[card.pokemonId] && (
                  <img 
                    src={pokemonImages[card.pokemonId]} 
                    alt={`Pokemon ${card.pokemonId}`}
                    className="pokemon-image"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="memory-game-over">
          <h2>{matched.length === rows * cols ? "Victoire !" : "Défaite !"}</h2>
          <p>{matched.length === rows * cols 
              ? "Vous avez trouvé toutes les paires !" 
              : "Vous avez épuisé toutes vos tentatives."}</p>
        </div>
      )}
    </div>
  );
};

export default Memory; 