import React, { useState, useEffect } from 'react';
import './App.css';

interface Weather {
  current: {
    temperature: number;
    description: string;
    humidity: string;
    wind_speed: string;
  };
}

const App: React.FC = () => {
  const [city, setCity] = useState<string>('Rio Grande do Sul');
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      const fetchToken = async () => {
        try {
          const tokenResponse = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'guilherme.florencio@cashpago.com.br',
              password: 'aprovado',
            }),
          });
          if (!tokenResponse.ok) {
            throw new Error('Falha ao obter token de autenticação');
          }
          const { token } = await tokenResponse.json();
          setToken(token);
        } catch (error: any) {
          setError(error.message);
          console.error('Erro ao obter token de autenticação:', error);
        }
      };

      fetchToken();
    }
  }, [token]);

  useEffect(() => {
    if (token && city) {
      fetchWeatherByCity(city);
    }
  }, [token]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
  };

  const fetchWeatherByCity = async (city: string) => {
    if (!token) {
      setError('Token de autenticação não disponível');
      return;
    }

    try {
      setError(null);
      const response = await fetch(`http://127.0.0.1:8000/api/weather?city=${city}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Falha ao obter dados do clima');
      }
      const data: Weather = await response.json();
      setWeather(data);
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao buscar dados do clima:', error);
    }
  };

  const fetchWeather = async () => {
    if (!token) {
      setError('Token de autenticação não disponível');
      return;
    }

    if (!city) {
      setError('É necessário informar a cidade');
      return;
    }

    await fetchWeatherByCity(city);
  };

  return (
    <div className="container">
      <input
        className="search-input"
        type="text"
        placeholder="Pesquisar por localidade"
        value={city}
        onChange={handleSearchChange}
        onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
      />
      {error && <div className="error">Erro: {error}</div>}
      {weather && (
        <div className="weather-card">
          <div className="temperature">
            <span className="temperature-value">{weather.current.temperature}</span>
            <span className="temperature-unit">°C</span>
          </div>
          <p>{weather.current.description}</p>
          <div className="location">
            <span>{city}, SC</span>
          </div>
          <div className="statistics">
            <div className="stat">
              <div className="stat-title">Vento</div>
              <div className="stat-value">{weather.current.wind_speed} km/h</div>
            </div>
            <div className="stat">
              <div className="stat-title">Umidade</div>
              <div className="stat-value">{weather.current.humidity}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
