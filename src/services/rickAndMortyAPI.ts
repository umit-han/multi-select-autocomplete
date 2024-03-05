import axios from 'axios';

export const fetchCharacters = async (query: string): Promise<any> => {
  try {
    const response = await axios.get(`https://rickandmortyapi.com/api/character/?name=${query}`);
    return response.data.results;
  } catch (error) {
    throw new Error('Error fetching characters');
  }
};
