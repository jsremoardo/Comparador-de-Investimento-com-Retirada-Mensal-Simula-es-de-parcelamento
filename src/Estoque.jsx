
import React, { useEffect, useState } from "react";

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/produtos")
      .then((r) => r.json())
      .then(setProdutos);
  }, []);

  return (
    <div className="card">
      <h2>Estoque</h2>
      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Valor (R$)</th>
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.id}>
              <td>{p.descricao}</td>
              <td>{p.valor.toFixed(2)}</td>
              <td>{p.quantidade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
