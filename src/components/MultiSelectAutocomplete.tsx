import React, { useState, useEffect, useRef } from 'react';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { TiTimes } from 'react-icons/ti';
import { fetchCharacters } from '../services/rickAndMortyAPI';
import { ICharacter } from '../interfaces/ICharacter.interface';

const MAX_SELECTED_CHARACTERS = 2;

const MultiSelectAutocomplete: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [characters, setCharacters] = useState<ICharacter.ICharacterProps[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<ICharacter.ICharacterProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      setLoading(true);
      setError('');

      fetchCharacters(query)
        .then((results: ICharacter.ICharacterProps[]) => {
          setCharacters(results);
          setLoading(false);
        })
        .catch(error => {
          console.log(error);
          setError('No results found for');
          setLoading(false);
        });
    } else {
      setCharacters([]);
    }
  }, [query]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setSelectedIndex(-1);
    setIsOpen(true);
  };

  const handleRemoveCharacter = (character: ICharacter.ICharacterProps) => {
    setSelectedCharacters(selectedCharacters.filter((c) => c.id !== character.id));
  };

  const handleCheckboxChange = (character: ICharacter.ICharacterProps) => {
    const isChecked = selectedCharacters.some((c) => c.id === character.id);
    if (isChecked) {
      setSelectedCharacters(selectedCharacters.filter((c) => c.id !== character.id));
    } else {
      setSelectedCharacters([character, ...selectedCharacters]);
    }
  };

  const renderHighlightedName = (name: string) => {
    const startIndex = name.toLowerCase().indexOf(query.toLowerCase());
    if (startIndex === -1) return name;
    const endIndex = startIndex + query.length;
    const prefix = name.substring(0, startIndex);
    const highlighted = name.substring(startIndex, endIndex);
    const suffix = name.substring(endIndex);
    return (
      <>
        {prefix}
        <strong>{highlighted}</strong>
        {suffix}
      </>
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prevIndex => Math.max(prevIndex - 1, 0));
        break;
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prevIndex => Math.min(prevIndex + 1, characters.length - 1));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex !== -1) {
          const character = characters[selectedIndex];
          handleCheckboxChange(character);
        }
        break;
      case 'Backspace':
      case 'Delete':
        if (selectedIndex !== -1) {
          const character = characters[selectedIndex];
          handleRemoveCharacter(character);
        }
        break;
      default:
        break;
    }
  
    if (listRef.current && selectedIndex !== -1) {
      const list = listRef.current;
      const selectedElement = list.children[selectedIndex] as HTMLElement;
      const listRect = list.getBoundingClientRect();
      const selectedRect = selectedElement.getBoundingClientRect();
  
      if (event.key === 'ArrowUp' && selectedRect.top < listRect.top) {
        list.scrollTop -= listRect.height;
      } else if (event.key === 'ArrowDown' && selectedRect.bottom > listRect.bottom) {
        list.scrollTop += listRect.height;
      }
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node) && listRef.current && !listRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      setIsOpen(false); 
    }
  }, [query]);

  const handleDropdownToggle = () => {
    if (!isOpen && inputRef.current && query.trim() === '') {
      inputRef.current.focus();
    } else {
      setIsOpen(prev => !prev);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-xl text-gray-500">Rick and Morty Character Selector</h1>
      <div className="relative flex">
        <div className="relative flex border border-gray-300 rounded-md pl-2 py-0 pr-10 w-[400px] h-12 focus:outline-none focus:border-blue-500">
          <div className="flex items-center space-x-1">
            {selectedCharacters.map((character, index) => (
              <div key={character.id} className={`${index >= selectedCharacters.length - MAX_SELECTED_CHARACTERS ? '' : 'hidden'}`}>
                <div className="bg-gray-200 rounded-md p-1 flex items-center">
                  <span className="mr-1 text-sm text-semibold text-nowrap">{character.name}</span>
                  <button onClick={() => handleRemoveCharacter(character)} className="bg-gray-700 text-gray-200 rounded-md p-0.5">
                    <TiTimes />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Type to search characters..."
            className="select-none focus:outline-none focus:border-none w-full h-full ml-1"
          />
          <div className="absolute top-0 right-0 h-full flex items-center pr-3" onClick={handleDropdownToggle}>
            {isOpen ? <BsChevronUp className="text-gray-400" /> : <BsChevronDown className="text-gray-400" />}
          </div>
        </div>
        {isOpen && query && (
          <div
            ref={listRef}
            className="absolute top-full bg-white rounded-md border border-gray-300 mt-1 w-[400px] max-h-96 overflow-y-auto"
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {loading && <div className='text-lg text-blue-400'>Loading...</div>}
            {error && <div className='text-lg text-red-400'> {error} <span className='italic'>{query}</span></div>}
            {characters.map((character, index) => (
              <div
                key={character.id}
                className={`flex items-center p-2 hover:bg-gray-100 border-solid border-b border-gray-300 last:border-b-0 ${index === selectedIndex ? 'bg-gray-200' : ''}`}
                onClick={() => handleCheckboxChange(character)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleCheckboxChange(character);
                  }
                }}
                tabIndex={0}
              >
                <input
                  type="checkbox"
                  id={character.name}
                  checked={selectedCharacters.some((c) => c.id === character.id)}
                  onChange={() => handleCheckboxChange(character)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 cursor-pointer"
                />
                <label   onClick={(event) => event.stopPropagation()} htmlFor={character.name} className="flex items-center ms-4 cursor-pointer">
                  <img src={character.image} alt={character.name} className="w-10 h-10 rounded-md object-cover" />
                  <div className="flex flex-col justify-center items-start ml-2">
                    <span className="ml-auto text-gray-800">{renderHighlightedName(character.name)} </span>
                    <span className="text-gray-400">{character.episode.length} episodes</span>
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectAutocomplete;