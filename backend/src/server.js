const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o MariaDB configurado no Codespace
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'admin',
  password: 'admin123',
  database: 'agroturma',
  waitForConnections: true,
  connectionLimit: 10,
});

// Rota 1: Dados do Dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    // 1. Total de trabalhadores ativos
    const [trabRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM trabalhadores WHERE status = 'ativo'"
    );
    const activeWorkersCount = Number(trabRows[0].total || 0);

    // 2. Total de caixas e valor total de produção
    const [prodRows] = await pool.query(
      'SELECT COALESCE(SUM(quantidade_caixas), 0) AS totalCaixas, COALESCE(SUM(valor_total), 0) AS valorProducao FROM lancamentos_producao'
    );
    const totalBoxes = Number(prodRows[0].totalCaixas || 0);
    const valorProducao = Number(prodRows[0].valorProducao || 0);

    // 3. Valor total de diárias
    const [diariaRows] = await pool.query(
      'SELECT COALESCE(SUM(valor), 0) AS valorDiarias FROM lancamentos_diaria'
    );
    const valorDiarias = Number(diariaRows[0].valorDiarias || 0);

    // 4. Valor total de rateio de caixeiros (se houver)
    let valorCaixeiros = 0;
    try {
      const [caixRows] = await pool.query(
        'SELECT COALESCE(SUM(valor_recebido), 0) AS valorCaixeiros FROM carregamento_caixeiros'
      );
      valorCaixeiros = Number(caixRows[0].valorCaixeiros || 0);
    } catch (e) {
      valorCaixeiros = 0;
    }

    // 5. Total de faltas no período
    let absencesCount = 0;
    try {
      const [faltasRows] = await pool.query('SELECT COUNT(*) AS total FROM faltas');
      absencesCount = Number(faltasRows[0].total || 0);
    } catch (e) {
      try {
        const [faltasRows2] = await pool.query('SELECT COUNT(*) AS total FROM lancamentos_falta');
        absencesCount = Number(faltasRows2[0].total || 0);
      } catch (e2) {
        absencesCount = 0;
      }
    }

    // 6. Produção agrupada por dia para o gráfico de barras
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const [chartRows] = await pool.query(`
      SELECT 
        data,
        DATE_FORMAT(data, '%d/%m') AS dateFormatted,
        DAYOFWEEK(data) AS dayOfWeek,
        SUM(quantidade_caixas) AS boxes
      FROM lancamentos_producao
      GROUP BY data, DATE_FORMAT(data, '%d/%m'), DAYOFWEEK(data)
      ORDER BY data ASC
      LIMIT 7
    `);

    const chartData = chartRows.map((row) => ({
      date: row.dateFormatted,
      day: diasSemana[(row.dayOfWeek - 1) % 7],
      boxes: Number(row.boxes || 0),
    }));

    // Soma geral a pagar (Produção + Diárias + Caixeiros)
    const totalPayable = valorProducao + valorDiarias + valorCaixeiros;

    res.json({
      activeWorkersCount,
      totalBoxes,
      absencesCount,
      totalPayable,
      chartData,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor Backend rodando em http://127.0.0.1:${PORT}`);
});