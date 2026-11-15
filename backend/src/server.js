const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'admin',
  password: 'admin123',
  database: 'agroturma',
  waitForConnections: true,
  connectionLimit: 10,
});

// Helper para gerar iniciais do avatar
function getInitials(name) {
  return String(name || 'TR')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

// ROTA 1: Dados do Dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    const [trabRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM trabalhadores WHERE status = 'ativo'"
    );
    const activeWorkersCount = Number(trabRows[0].total || 0);

    const [prodRows] = await pool.query(
      'SELECT COALESCE(SUM(quantidade_caixas), 0) AS totalCaixas, COALESCE(SUM(valor_total), 0) AS valorProducao FROM lancamentos_producao'
    );
    const totalBoxes = Number(prodRows[0].totalCaixas || 0);
    const valorProducao = Number(prodRows[0].valorProducao || 0);

    const [diariaRows] = await pool.query(
      'SELECT COALESCE(SUM(valor), 0) AS valorDiarias FROM lancamentos_diaria'
    );
    const valorDiarias = Number(diariaRows[0].valorDiarias || 0);

    let valorCaixeiros = 0;
    try {
      const [caixRows] = await pool.query(
        'SELECT COALESCE(SUM(valor_recebido), 0) AS valorCaixeiros FROM carregamento_caixeiros'
      );
      valorCaixeiros = Number(caixRows[0].valorCaixeiros || 0);
    } catch (e) {
      valorCaixeiros = 0;
    }

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

// ROTA 2: Listar Trabalhadores (GET /api/workers)
app.get('/api/workers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM trabalhadores ORDER BY id ASC');
    const workers = rows.map((r) => {
      const name = r.nome || r.name || 'Trabalhador';
      const status = r.status === 'inativo' ? 'inativo' : 'ativo';
      return {
        id: String(r.id),
        name,
        phone: r.telefone || r.phone || '',
        cpf: r.cpf || '',
        notes: r.observacoes || r.observacao || r.funcao || '',
        status,
        avatarInitials: getInitials(name),
        avatarColor: status === 'inativo' ? 'bg-amber-600' : 'bg-emerald-700',
        createdAt: r.criado_em
          ? new Date(r.criado_em).toISOString().split('T')[0]
          : '2025-06-01',
      };
    });
    res.json(workers);
  } catch (error) {
    console.error('Erro ao listar trabalhadores:', error);
    res.status(500).json({ error: 'Erro ao buscar trabalhadores' });
  }
});

// ROTA 3: Cadastrar Trabalhador (POST /api/workers)
app.post('/api/workers', async (req, res) => {
  try {
    const { name, phone, cpf, notes, status } = req.body;
    const [cols] = await pool.query('SHOW COLUMNS FROM trabalhadores');
    const colNames = cols.map((c) => c.Field);

    const fields = [];
    const values = [];

    if (colNames.includes('nome')) {
      fields.push('nome');
      values.push(name);
    }
    if (colNames.includes('telefone')) {
      fields.push('telefone');
      values.push(phone || '');
    }
    if (colNames.includes('cpf')) {
      fields.push('cpf');
      values.push(cpf || null);
    }
    if (colNames.includes('observacoes')) {
      fields.push('observacoes');
      values.push(notes || null);
    } else if (colNames.includes('observacao')) {
      fields.push('observacao');
      values.push(notes || null);
    }
    if (colNames.includes('status')) {
      fields.push('status');
      values.push(status || 'ativo');
    }

    const placeholders = fields.map(() => '?').join(', ');
    const [result] = await pool.query(
      `INSERT INTO trabalhadores (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    const newWorker = {
      id: String(result.insertId),
      name,
      phone: phone || '',
      cpf: cpf || '',
      notes: notes || '',
      status: status || 'ativo',
      avatarInitials: getInitials(name),
      avatarColor: 'bg-emerald-800',
      createdAt: new Date().toISOString().split('T')[0],
    };

    res.status(201).json(newWorker);
  } catch (error) {
    console.error('Erro ao cadastrar trabalhador:', error);
    res.status(500).json({ error: 'Erro ao salvar trabalhador no banco' });
  }
});

// ROTA 4: Inativar / Reativar Trabalhador (PATCH /api/workers/:id/status)
app.patch('/api/workers/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE trabalhadores SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor Backend rodando em http://127.0.0.1:${PORT}`);
});