import { useState } from 'react';
import "./App.css"

function BuscaInteligente() {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const buscarInformacao = async () => {
    if (!termo) return alert('Digite algo!');
    setLoading(true);
    setErro('');
    setResultados([]);

    try {
      const busca = await fetch(
        `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          termo
        )}&format=json&origin=*`
      );
      const dadosBusca = await busca.json();
      const resultadosBusca = dadosBusca.query.search;

      if (resultadosBusca.length === 0) {
        setErro('Nada encontrado.');
        return;
      }

      let novosResultados = [];

      // Pega o primeiro resultado e adiciona
      const primeiroResultado = resultadosBusca[0];
      const resumoPrincipal = await fetch(
        `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          primeiroResultado.title
        )}`
      );
      const dadosResumoPrincipal = await resumoPrincipal.json();
      novosResultados.push(dadosResumoPrincipal);

      // Palavras-chave baseadas no título do primeiro
      const tituloBase = dadosResumoPrincipal.title.toLowerCase();


      for (let i = 1; i < resultadosBusca.length && novosResultados.length < 3; i++) {
        const item = resultadosBusca[i];
        const resumo = await fetch(
          `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
            item.title
          )}`
        );
        const dadosResumo = await resumo.json();

        const tituloComparado = dadosResumo.title?.toLowerCase() || '';
        const extractComparado = dadosResumo.extract?.toLowerCase() || '';

        const parecidoComBase =
          tituloComparado.includes(tituloBase) ||
          extractComparado.includes(tituloBase) ||
          extractComparado.includes(termo.toLowerCase());

        if (parecidoComBase) {
          novosResultados.push(dadosResumo);
        }
      }

      if (novosResultados.length === 0) {
        setErro('Nada relevante encontrado.');
      } else {
        setResultados(novosResultados);
      }
    } catch (err) {
      setErro('Erro ao buscar dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🔎 Wikipedia Inteligente</h1>
      <input
        type="text"
        placeholder="Ex: dom pedro"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
      />
      <button onClick={buscarInformacao}>Buscar</button>

      {loading && <p>Carregando...</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      {resultados.length > 0 && (
        <div className="resultado">
          {resultados.map((resultado, index) => (
            <div key={index} style={{ marginBottom: '30px' }}>
              <h2>{resultado.title}</h2>
              <p><em>{resultado.description}</em></p>
              {resultado.thumbnail && (
                <img
                  src={resultado.thumbnail.source}
                  alt={resultado.title}
                  width={250}
                />
              )}
              <p>{resultado.extract}</p>
              <a href={resultado.content_urls.desktop.page} target="_blank" rel="noreferrer">
                Ver na Wikipedia
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuscaInteligente;
