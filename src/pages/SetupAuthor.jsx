import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function SetupAuthor() {
  const [status, setStatus] = useState("Iniciando...");

  useEffect(() => {
    async function runSetup() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setStatus("Você precisa estar logado!");
          return;
        }

        // Try common author table names
        const tables = ["authors", "profiles", "users_public"];
        let success = false;
        let lastError = null;

        for (const table of tables) {
          setStatus(`Tentando vincular seu ID na tabela '${table}'...`);
          const { error } = await supabase
            .from(table)
            .upsert({ id: user.id, name: "Ronald" });

          if (!error) {
            setStatus(`Sucesso! Seu usuário foi vinculado como 'Ronald' na tabela '${table}'.`);
            success = true;
            break;
          }
          lastError = error;
        }

        if (!success) {
          setStatus(`Erro ao vincular: ${lastError?.message || "Tabela não encontrada"}`);
        }
      } catch (err) {
        setStatus(`Erro inesperado: ${err.message}`);
      }
    }

    runSetup();
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Configurador de Autor</h2>
      <p>{status}</p>
      <button onClick={() => window.location.href = "/posts"} className="btn btn-primary" style={{ marginTop: "1rem" }}>
        Voltar para Posts
      </button>
    </div>
  );
}
