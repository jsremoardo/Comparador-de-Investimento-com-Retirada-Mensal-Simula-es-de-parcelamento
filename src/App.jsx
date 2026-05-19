

import React, { useEffect, useMemo, useState } from "react";

export default function ComparadorInvestimento() {
  const [nomeSimulacao, setNomeSimulacao] = useState("");
  const [valorInicial, setValorInicial] = useState("");
  const [taxa, setTaxa] = useState("");
  const [meses, setMeses] = useState("");
  const [parcela, setParcela] = useState("");
  const [mostrarTabela, setMostrarTabela] = useState(false);
  const [calcular, setCalcular] = useState(false);
  const [simulacoes, setSimulacoes] = useState(() =>
    JSON.parse(localStorage.getItem("simulacoes_investimento")) || []
  );

  useEffect(() => {
    localStorage.setItem("simulacoes_investimento", JSON.stringify(simulacoes));
  }, [simulacoes]);

  const resultado = useMemo(() => {
    if (!calcular) return null;

    const principal = Number(valorInicial);
    const juros = Number(taxa) / 100;
    const tempo = Number(meses);
    const retirada = Number(parcela);

    if (!principal || !tempo || juros < 0 || retirada < 0) {
      return { erro: "Preencha todos os campos corretamente." };
    }

    let saldo = principal;
    const tabela = [];
    let totalRendimento = 0;
    let totalRetirada = 0;

    for (let mes = 1; mes <= tempo; mes++) {
      const saldoInicial = saldo;
      const rendimento = saldo * juros;
      saldo = saldo + rendimento - retirada;

      totalRendimento += rendimento;
      totalRetirada += retirada;

      tabela.push({ mes, saldoInicial, rendimento, retirada, saldoFinal: saldo });
    }

    return {
      saldoFinal: saldo,
      tabela,
      totalRendimento,
      totalRetirada,
    };
  }, [calcular, valorInicial, taxa, meses, parcela]);

  function salvarSimulacao() {
    if (!nomeSimulacao.trim()) return;
    setSimulacoes((prev) => [...prev, { titulo: nomeSimulacao, valorInicial, taxa, meses, parcela }]);
    setNomeSimulacao("");
    setValorInicial("");
    setTaxa("");
    setMeses("");
    setParcela("");
    setCalcular(false);
    setMostrarTabela(false);
  }

  function carregarSimulacao(sim) {
    setValorInicial(sim.valorInicial);
    setTaxa(sim.taxa);
    setMeses(sim.meses);
    setParcela(sim.parcela);
    setCalcular(false);
    setMostrarTabela(false);
  }

  function exportarCSV() {
    if (!resultado || !resultado.tabela) return;
    const linhas = [
      ["Mes", "Saldo Inicial", "Rendimento", "Retirada", "Saldo Final"],
      ...resultado.tabela.map((l) => [l.mes, l.saldoInicial, l.rendimento, l.retirada, l.saldoFinal]),
      ["TOTAL", "", resultado.totalRendimento, resultado.totalRetirada, resultado.saldoFinal],
    ];

    const csv = linhas.map((l) => l.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simulacao.csv";
    a.click();
  }

  const inputClass = "border p-2 rounded-lg w-full mb-3";
  const buttonClass = "px-4 py-2 rounded-xl bg-blue-600 text-white mr-2";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Comparador de Investimento com Retirada Mensal</h1>

        <div className="mb-4">
          <h2 className="font-semibold mb-2">Simulações salvas</h2>
          {simulacoes.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma simulação salva.</p>
          ) : (
            simulacoes.map((sim, index) => (
              <div key={index} className="flex items-center gap-3 mb-1">
                <button className="text-blue-700 underline" onClick={() => carregarSimulacao(sim)}>{sim.titulo}</button>
                <button className="text-sm text-red-600 underline" onClick={() => setSimulacoes((prev) => prev.filter((_, i) => i !== index))}>Excluir</button>
              </div>
            ))
          )}
        </div>

        <input className={inputClass} placeholder="Título da nova simulação" value={nomeSimulacao} onChange={(e) => setNomeSimulacao(e.target.value)} />
        <input className={inputClass} placeholder="Valor inicial" value={valorInicial} onChange={(e) => { setValorInicial(e.target.value); setCalcular(false); }} />
        <input className={inputClass} placeholder="Taxa de juros % ao mês" value={taxa} onChange={(e) => { setTaxa(e.target.value); setCalcular(false); }} />
        <input className={inputClass} placeholder="Tempo em meses" value={meses} onChange={(e) => { setMeses(e.target.value); setCalcular(false); }} />
        <input className={inputClass} placeholder="Parcela retirada por mês" value={parcela} onChange={(e) => { setParcela(e.target.value); setCalcular(false); }} />

        <button className={buttonClass} onClick={() => { setCalcular(true); setMostrarTabela(false); }}>Resultado</button>
        <button className={buttonClass} onClick={salvarSimulacao}>Salvar simulação</button>

        {resultado && !resultado.erro && (
          <div className="mt-5">
            <p className="text-lg font-semibold">Saldo final: R$ {resultado.saldoFinal.toFixed(2)}</p>
            <button className="text-blue-700 underline" onClick={() => setMostrarTabela(!mostrarTabela)}>
              {mostrarTabela ? "Ocultar resultados mês a mês" : "Exibir resultados mês a mês"}
            </button>

            {mostrarTabela && (
              <div className="overflow-x-auto mt-4" id="tabela-impressao">
                <div className="mb-3">
                  <button className={buttonClass} onClick={exportarCSV}>Exportar Excel</button>
                  <button className={buttonClass} onClick={() => window.print()}>Imprimir</button>
                </div>

                <table className="w-full border border-gray-300 text-sm">
                  <thead>
                    <tr>
                      <th className="border p-2">Mês</th>
                      <th className="border p-2">Saldo Inicial</th>
                      <th className="border p-2">Rendimento</th>
                      <th className="border p-2">Retirada</th>
                      <th className="border p-2">Saldo Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.tabela.map((linha) => (
                      <tr key={linha.mes}>
                        <td className="border p-2">{linha.mes}</td>
                        <td className="border p-2">R$ {linha.saldoInicial.toFixed(2)}</td>
                        <td className="border p-2">R$ {linha.rendimento.toFixed(2)}</td>
                        <td className="border p-2">R$ {linha.retirada.toFixed(2)}</td>
                        <td className="border p-2">R$ {linha.saldoFinal.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="border p-2">TOTAL</td>
                      <td className="border p-2"></td>
                      <td className="border p-2">R$ {resultado.totalRendimento.toFixed(2)}</td>
                      <td className="border p-2">R$ {resultado.totalRetirada.toFixed(2)}</td>
                      <td className="border p-2">R$ {resultado.saldoFinal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


