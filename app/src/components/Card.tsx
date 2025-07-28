import React from 'react';

interface CardProps {
  card: {
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    value: number;
  };
  faceDown?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({
  card,
  faceDown = false,
  selected = false,
  disabled = false,
  onClick
}) => {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '?';
    }
  };

  const getValueDisplay = (value: number) => {
    switch (value) {
      case 1: return 'A';
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      default: return value.toString();
    }
  };

  if (faceDown) {
    return (
      <div 
        className={`card bg-blue-900 text-blue-100 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        onClick={!disabled ? onClick : undefined}
      >
        <div className="text-2xl">🂠</div>
      </div>
    );
  }

  return (
    <div 
      className={`card ${card.suit} ${selected ? 'selected' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="text-lg font-bold">
        {getValueDisplay(card.value)}
      </div>
      <div className="text-2xl">
        {getSuitSymbol(card.suit)}
      </div>
    </div>
  );
};

export default Card;
