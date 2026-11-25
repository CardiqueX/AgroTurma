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
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
});

// Garante a existência da tabela de controle de pagamentos sem alterar o schema inicial
async function ensurePaymentsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pagamentos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trabalhador_id INT NOT NULL UNIQUE,
      status VARCHAR(20) NOT NULL DEFAULT 'a_pagar',
      forma_pagamento VARCHAR(50) NULL,
      valor_pago DECIMAL(10,2) DEFAULT 0.00,
      pago_em DATETIME NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (trabalhador_id) REFERENCES trabalhadores(id) ON DELETE CASCADE
    )
  `);
}

ensurePaymentsTable().catch((err) =>
  console.error('Aviso ao verificar tabela pagamentos:', err.message)
);

function getInitials(name) {
  return String(name || 'TR')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

function toSqlDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return dateStr;
}

function toBrDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const d = String(val.getUTCDate()).padStart(2, '0');
    const m = String(val.getUTCMonth() + 1).padStart(2, '0');
    const y = val.getUTCFullYear();
    return `${d}/${m}/${y}`;
  }
  const str = String(val).split('T')[0];
  if (str.includes('-')) {
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
  }
  return str;
}

function toBrDateTime(val) {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} às ${hours}:${mins}`;
}

async function registrarAuditoria({
  tabela,
  registroId,
  campo,
  valorAnterior,
  valorNovo,
  alteradoPor = 'Maria Apontadora',
  motivo = '',
}) {
  try {
    await pool.query(
      `INSERT INTO historico_alteracoes
        (tabela_afetada, registro_id, campo_alterado, valor_anterior, valor_novo, alterado_por, motivo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tabela, registroId, campo, valorAnterior, valorNovo, alteradoPor, motivo]
    );
  } catch (err) {
    console.error('Aviso ao gravar auditoria:', err.message);
  }
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

    const [caixRows] = await pool.query(
      'SELECT COALESCE(SUM(valor_recebido), 0) AS valorCaixeiros FROM carregamento_caixeiros'
    );
    const valorCaixeiros = Number(caixRows[0].valorCaixeiros || 0);

    const [faltasRows] = await pool.query('SELECT COUNT(*) AS total FROM faltas');
    const absencesCount = Number(faltasRows[0].total || 0);

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const [chartRows] = await pool.query(`
      SELECT 
        data,
        DATE_FORMAT(data, '%d/%m') AS dateFormatted,
        DAYOFWEEK(data) AS dayOfWeek,
        SUM(quantidade_caixas) AS boxes
      FROM lancamentos_producao
      GROUP BY data, DATE_FORMAT(data, '%d/%m'), DAYOFWEEK(data)
      ORDER BY data DESC
      LIMIT 7
    `);

    const chartData = chartRows.reverse().map((row) => ({
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

// ROTA 2: Listar Trabalhadores
app.get('/api/workers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM trabalhadores ORDER BY id ASC');
    const workers = rows.map((r) => {
      const status = r.status === 'inativo' ? 'inativo' : 'ativo';
      return {
        id: String(r.id),
        name: r.nome,
        phone: r.telefone || '',
        cpf: r.cpf || '',
        notes: r.observacao || '',
        status,
        avatarInitials: getInitials(r.nome),
        avatarColor: status === 'inativo' ? 'bg-amber-600' : 'bg-emerald-700',
        createdAt: r.created_at
          ? new Date(r.created_at).toISOString().split('T')[0]
          : '2025-06-01',
      };
    });
    res.json(workers);
  } catch (error) {
    console.error('Erro ao listar trabalhadores:', error);
    res.status(500).json({ error: 'Erro ao buscar trabalhadores' });
  }
});

// ROTA 3: Cadastrar Trabalhador
app.post('/api/workers', async (req, res) => {
  try {
    const { name, phone, cpf, notes, status } = req.body;
    const cleanCpf = cpf && String(cpf).trim() !== '' ? String(cpf).trim() : null;

    const [result] = await pool.query(
      `INSERT INTO trabalhadores (nome, telefone, cpf, status, observacao)
       VALUES (?, ?, ?, ?, ?)`,
      [name, phone || null, cleanCpf, status || 'ativo', notes || null]
    );

    await registrarAuditoria({
      tabela: 'trabalhadores',
      registroId: result.insertId,
      campo: 'cadastro',
      valorAnterior: 'Sem registro',
      valorNovo: name,
      motivo: `Novo trabalhador cadastrado: ${name}`,
    });

    res.status(201).json({
      id: String(result.insertId),
      name,
      phone: phone || '',
      cpf: cleanCpf || '',
      notes: notes || '',
      status: status || 'ativo',
      avatarInitials: getInitials(name),
      avatarColor: 'bg-emerald-800',
      createdAt: new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Erro ao cadastrar trabalhador:', error);
    res.status(500).json({ error: 'Erro ao salvar trabalhador no banco' });
  }
});

// ROTA 4: Inativar / Reativar Trabalhador
app.patch('/api/workers/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [current] = await pool.query('SELECT nome, status FROM trabalhadores WHERE id = ?', [id]);
    const oldStatus = current[0]?.status || 'ativo';
    const nome = current[0]?.nome || `Trabalhador #${id}`;

    await pool.query('UPDATE trabalhadores SET status = ? WHERE id = ?', [status, id]);

    await registrarAuditoria({
      tabela: 'trabalhadores',
      registroId: Number(id),
      campo: 'status',
      valorAnterior: oldStatus,
      valorNovo: status,
      motivo: `Status de ${nome} alterado para ${status}`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// ROTA 5: Listar Lançamentos (Produção, Diárias e Faltas)
app.get('/api/launches', async (req, res) => {
  try {
    const allLaunches = [];

    const [prodRows] = await pool.query(`
      SELECT l.*, t.nome AS workerName
      FROM lancamentos_producao l
      LEFT JOIN trabalhadores t ON l.trabalhador_id = t.id
      ORDER BY l.data DESC, l.id DESC
    `);
    for (const r of prodRows) {
      const qty = Number(r.quantidade_caixas || 0);
      allLaunches.push({
        id: `prod_${r.id}`,
        date: toBrDate(r.data),
        workerId: String(r.trabalhador_id),
        workerName: r.workerName || 'Trabalhador',
        type: 'producao',
        description: `${qty} caixas`,
        productService: 'Caixa de Alho',
        quantity: qty,
        unitValue: Number(r.valor_unitario_caixa || 0),
        totalValue: Number(r.valor_total || 0),
        notes: r.observacao || '',
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      });
    }

    const [diariaRows] = await pool.query(`
      SELECT l.*, t.nome AS workerName, fd.nome AS funcaoNome
      FROM lancamentos_diaria l
      LEFT JOIN trabalhadores t ON l.trabalhador_id = t.id
      LEFT JOIN funcoes_diaria fd ON l.funcao_diaria_id = fd.id
      ORDER BY l.data DESC, l.id DESC
    `);
    for (const r of diariaRows) {
      allLaunches.push({
        id: `diaria_${r.id}`,
        date: toBrDate(r.data),
        workerId: String(r.trabalhador_id),
        workerName: r.workerName || 'Trabalhador',
        type: 'diaria',
        description: r.funcaoNome || 'Diária',
        totalValue: Number(r.valor || 0),
        notes: r.observacao || '',
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      });
    }

    const [faltasRows] = await pool.query(`
      SELECT f.*, t.nome AS workerName
      FROM faltas f
      LEFT JOIN trabalhadores t ON f.trabalhador_id = t.id
      ORDER BY f.data DESC, f.id DESC
    `);
    for (const r of faltasRows) {
      const motivo = r.motivo || 'Não compareceu';
      allLaunches.push({
        id: `falta_${r.id}`,
        date: toBrDate(r.data),
        workerId: String(r.trabalhador_id),
        workerName: r.workerName || 'Trabalhador',
        type: 'falta',
        description: motivo,
        totalValue: 0,
        reason: motivo,
        notes: r.observacao || '',
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      });
    }

    res.json(allLaunches);
  } catch (error) {
    console.error('Erro ao listar lançamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar lançamentos' });
  }
});

// ROTA 6: Salvar Novo Lançamento (Produção, Diária ou Falta)
app.post('/api/launches', async (req, res) => {
  try {
    const {
      date,
      workerId,
      workerName,
      type,
      description,
      productService,
      quantity,
      unitValue,
      totalValue,
      reason,
      notes,
    } = req.body;

    const sqlDate = toSqlDate(date);
    const [closedPeriod] = await pool.query(
      `SELECT id FROM fechamentos_semanais
   WHERE status = 'FECHADO'
     AND ? BETWEEN data_inicio AND data_fim
   LIMIT 1`,
      [sqlDate]
    );

    if (closedPeriod.length > 0) {
      return res.status(409).json({
        error: 'Não é possível lançar dados em um período já fechado.',
      });
    }
    const trabId = Number(workerId);
    let insertedId = '';
    let numericId = 0;
    let tabelaAfetada = '';
    let campoAlterado = '';
    let valorNovo = '';
    let finalTotal = Number(totalValue || 0);

    if (type === 'producao') {
      const qty = Number(quantity || 0);
      const unit = Number(unitValue || 0);
      finalTotal = qty * unit;

      const [result] = await pool.query(
        `INSERT INTO lancamentos_producao
          (trabalhador_id, data, quantidade_caixas, valor_unitario_caixa, observacao)
         VALUES (?, ?, ?, ?, ?)`,
        [trabId, sqlDate, qty, unit, notes || null]
      );

      numericId = result.insertId;
      insertedId = `prod_${numericId}`;
      tabelaAfetada = 'lancamentos_producao';
      campoAlterado = 'quantidade_caixas';
      valorNovo = `${qty} caixas (R$ ${finalTotal.toFixed(2)})`;
    } else if (type === 'diaria') {
      let funcaoId = null;
      if (description) {
        const [fnMatch] = await pool.query(
          'SELECT id FROM funcoes_diaria WHERE LOWER(nome) = LOWER(?) LIMIT 1',
          [String(description).trim()]
        );
        if (fnMatch.length > 0) funcaoId = fnMatch[0].id;
      }
      if (!funcaoId) {
        const [fnFirst] = await pool.query(
          'SELECT id FROM funcoes_diaria WHERE ativo = TRUE ORDER BY id ASC LIMIT 1'
        );
        if (fnFirst.length > 0) {
          funcaoId = fnFirst[0].id;
        } else {
          const [fnInsert] = await pool.query(
            "INSERT INTO funcoes_diaria (nome, valor_padrao, ativo) VALUES ('Diária Geral', ?, TRUE)",
            [finalTotal]
          );
          funcaoId = fnInsert.insertId;
        }
      }

      const [result] = await pool.query(
        `INSERT INTO lancamentos_diaria
          (trabalhador_id, funcao_diaria_id, data, valor, observacao)
         VALUES (?, ?, ?, ?, ?)`,
        [trabId, funcaoId, sqlDate, finalTotal, notes || null]
      );

      numericId = result.insertId;
      insertedId = `diaria_${numericId}`;
      tabelaAfetada = 'lancamentos_diaria';
      campoAlterado = 'valor';
      valorNovo = `R$ ${finalTotal.toFixed(2)}`;
    } else if (type === 'falta') {
      const motivoFinal = reason || 'Não compareceu';
      const possuiAtestado =
        String(motivoFinal).toLowerCase().includes('atestado') ||
        String(motivoFinal).toLowerCase().includes('médic') ||
        String(motivoFinal).toLowerCase().includes('medic');
      const descontaFinanceiro = !possuiAtestado;
      finalTotal = 0;

      const [result] = await pool.query(
        `INSERT INTO faltas
          (trabalhador_id, data, motivo, possui_atestado, desconta_financeiro, observacao)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [trabId, sqlDate, motivoFinal, possuiAtestado ? 1 : 0, descontaFinanceiro ? 1 : 0, notes || null]
      );

      numericId = result.insertId;
      insertedId = `falta_${numericId}`;
      tabelaAfetada = 'faltas';
      campoAlterado = 'motivo';
      valorNovo = motivoFinal;
    }

    if (tabelaAfetada && numericId) {
      await registrarAuditoria({
        tabela: tabelaAfetada,
        registroId: numericId,
        campo: campoAlterado,
        valorAnterior: 'Sem registro',
        valorNovo,
        motivo: notes || `Lançamento de ${type} para ${workerName}`,
      });
    }

    res.status(201).json({
      id: insertedId,
      date,
      workerId: String(workerId),
      workerName,
      type,
      description,
      productService,
      quantity,
      unitValue,
      totalValue: finalTotal,
      reason,
      notes,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao salvar lançamento:', error);
    res.status(500).json({ error: 'Erro ao gravar lançamento no banco de dados' });
  }
});

// ROTA 7: Listar Folha de Pagamentos (calculada direto do MariaDB)
app.get('/api/payments', async (req, res) => {
  try {
    await ensurePaymentsTable();

    const [fechRows] = await pool.query(
      'SELECT data_inicio, data_fim FROM fechamentos_semanais ORDER BY id DESC LIMIT 1'
    );
    const periodLabel =
      fechRows.length > 0
        ? `${toBrDate(fechRows[0].data_inicio)} a ${toBrDate(fechRows[0].data_fim)}`
        : 'Período Atual';

    const [rows] = await pool.query(`
      SELECT
        t.id,
        t.nome,
        COALESCE(p.caixas, 0) AS boxesCount,
        COALESCE(p.valor_prod, 0) AS totalProducao,
        COALESCE(d.valor_diaria, 0) AS totalDiarias,
        COALESCE(c.valor_caix, 0) AS totalCaixeiros,
        pg.status AS payStatus,
        pg.forma_pagamento AS paymentMethod,
        pg.pago_em AS paidAt
      FROM trabalhadores t
      LEFT JOIN (
        SELECT trabalhador_id, SUM(quantidade_caixas) AS caixas, SUM(valor_total) AS valor_prod
        FROM lancamentos_producao
        GROUP BY trabalhador_id
      ) p ON p.trabalhador_id = t.id
      LEFT JOIN (
        SELECT trabalhador_id, SUM(valor) AS valor_diaria
        FROM lancamentos_diaria
        GROUP BY trabalhador_id
      ) d ON d.trabalhador_id = t.id
      LEFT JOIN (
        SELECT trabalhador_id, SUM(valor_recebido) AS valor_caix
        FROM carregamento_caixeiros
        GROUP BY trabalhador_id
      ) c ON c.trabalhador_id = t.id
      LEFT JOIN pagamentos pg ON pg.trabalhador_id = t.id
      ORDER BY t.id ASC
    `);

    const payments = rows.map((r) => {
      const totalProducao = Number(r.totalProducao || 0) + Number(r.totalCaixeiros || 0);
      const totalDiarias = Number(r.totalDiarias || 0);
      const grossTotal = totalProducao + totalDiarias;
      const discounts = 0;
      const netTotal = grossTotal - discounts;

      return {
        id: `pay_${r.id}`,
        workerId: String(r.id),
        workerName: r.nome,
        period: periodLabel,
        totalDiarias,
        totalProducao,
        boxesCount: Number(r.boxesCount || 0),
        grossTotal,
        discounts,
        netTotal,
        status: r.payStatus === 'pago' ? 'pago' : 'a_pagar',
        paidAt: r.paidAt ? toBrDateTime(r.paidAt) : undefined,
        paymentMethod: r.paymentMethod || undefined,
      };
    });

    res.json(payments);
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ error: 'Erro ao consultar folha de pagamentos' });
  }
});

// ROTA 8: Confirmar Pagamento de um Trabalhador
app.post('/api/payments/:workerId/pay', async (req, res) => {
  try {
    await ensurePaymentsTable();
    const { workerId } = req.params;
    const { method = 'PIX', netTotal = 0, workerName = '' } = req.body;
    const trabId = Number(workerId);

    await pool.query(
      `INSERT INTO pagamentos (trabalhador_id, status, forma_pagamento, valor_pago, pago_em)
       VALUES (?, 'pago', ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         status = 'pago',
         forma_pagamento = VALUES(forma_pagamento),
         valor_pago = VALUES(valor_pago),
         pago_em = NOW()`,
      [trabId, method, Number(netTotal || 0)]
    );

    const paidAt = toBrDateTime(new Date());

    await registrarAuditoria({
      tabela: 'pagamentos',
      registroId: trabId,
      campo: 'status',
      valorAnterior: 'a_pagar',
      valorNovo: `pago (${method} - R$ ${Number(netTotal || 0).toFixed(2)})`,
      motivo: `Pagamento confirmado para ${workerName || `Trabalhador #${trabId}`}`,
    });

    res.json({ success: true, paidAt, paymentMethod: method });
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    res.status(500).json({ error: 'Erro ao confirmar pagamento no banco' });
  }
});
// ROTA 9: Estornar pagamento
app.post('/api/payments/:workerId/unpay', async (req, res) => {
  try {
    await ensurePaymentsTable();

    const trabId = Number(req.params.workerId);

    const [result] = await pool.query(
      `UPDATE pagamentos
       SET status = 'a_pagar',
           forma_pagamento = NULL,
           valor_pago = 0,
           pago_em = NULL
       WHERE trabalhador_id = ?`,
      [trabId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    await registrarAuditoria({
      tabela: 'pagamentos',
      registroId: trabId,
      campo: 'status',
      valorAnterior: 'pago',
      valorNovo: 'a_pagar',
      motivo: `Estorno do pagamento do trabalhador #${trabId}`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao estornar pagamento:', error);
    res.status(500).json({ error: 'Erro ao estornar pagamento' });
  }
});


// ROTA 9: Consultar fechamento e resumo do período selecionado
app.get('/api/week-closure', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let inicio = startDate;
    let fim = endDate;

    if (!inicio || !fim) {
      const [latest] = await pool.query(
        'SELECT data_inicio, data_fim FROM fechamentos_semanais ORDER BY id DESC LIMIT 1'
      );

      if (latest.length) {
        inicio = latest[0].data_inicio;
        fim = latest[0].data_fim;
      } else {
        const [dates] = await pool.query(`
          SELECT
            DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AS inicio,
            DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 6 DAY) AS fim
        `);
        inicio = dates[0].inicio;
        fim = dates[0].fim;
      }
    }

    const [closures] = await pool.query(
      `SELECT * FROM fechamentos_semanais
       WHERE data_inicio = ? AND data_fim = ?
       ORDER BY id DESC LIMIT 1`,
      [inicio, fim]
    );

    const closure = closures[0];

    const [prod] = await pool.query(
      `SELECT
         COALESCE(SUM(quantidade_caixas), 0) AS caixas,
         COALESCE(SUM(valor_total), 0) AS valor
       FROM lancamentos_producao
       WHERE data BETWEEN ? AND ?`,
      [inicio, fim]
    );

    const [diarias] = await pool.query(
      `SELECT COALESCE(SUM(valor), 0) AS valor
       FROM lancamentos_diaria
       WHERE data BETWEEN ? AND ?`,
      [inicio, fim]
    );

    const [faltas] = await pool.query(
      `SELECT COUNT(*) AS total FROM faltas
       WHERE data BETWEEN ? AND ?`,
      [inicio, fim]
    );

    const [workers] = await pool.query(
      `SELECT COUNT(DISTINCT trabalhador_id) AS total
       FROM (
         SELECT trabalhador_id FROM lancamentos_producao
         WHERE data BETWEEN ? AND ?
         UNION
         SELECT trabalhador_id FROM lancamentos_diaria
         WHERE data BETWEEN ? AND ?
       ) AS periodo`,
      [inicio, fim, inicio, fim]
    );

    const [days] = await pool.query(
      `SELECT COUNT(DISTINCT data) AS total
       FROM (
         SELECT data FROM lancamentos_producao
         WHERE data BETWEEN ? AND ?
         UNION
         SELECT data FROM lancamentos_diaria
         WHERE data BETWEEN ? AND ?
       ) AS periodo`,
      [inicio, fim, inicio, fim]
    );

    const totalBoxes = Number(prod[0].caixas || 0);
    const totalProductionValue = Number(prod[0].valor || 0);
    const totalDailyValue = Number(diarias[0].valor || 0);

    res.json({
      id: closure?.id ?? null,
      startDate: String(inicio).slice(0, 10),
      endDate: String(fim).slice(0, 10),
      period: `${toBrDate(inicio)} a ${toBrDate(fim)}`,
      activeWorkers: Number(workers[0].total || 0),
      workedDays: Number(days[0].total || 0),
      totalBoxes,
      absencesCount: Number(faltas[0].total || 0),
      totalProductionValue,
      totalDailyValue,
      totalPayable: totalProductionValue + totalDailyValue,
      isClosed: closure ? String(closure.status).toUpperCase() === 'FECHADO' : false,
      closedAt: closure?.fechado_em ? toBrDateTime(closure.fechado_em) : undefined,
      closedBy: closure?.status === 'FECHADO' ? 'Administrador da Fazenda' : undefined,
    });
  } catch (error) {
    console.error('Erro ao consultar fechamento semanal:', error);
    res.status(500).json({ error: 'Erro ao consultar fechamento da semana' });
  }
});

// ROTA 10: Fechar ou reabrir período selecionado
app.post('/api/week-closure/toggle', async (req, res) => {
  const { startDate, endDate } = req.body;

  if (
    !startDate ||
    !endDate ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
    startDate > endDate
  ) {
    return res.status(400).json({ error: 'Informe um período válido.' });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT * FROM fechamentos_semanais
       WHERE data_inicio = ? AND data_fim = ?
       ORDER BY id DESC LIMIT 1 FOR UPDATE`,
      [startDate, endDate]
    );

    let fechamentoId;
    let oldStatus = 'ABERTO';
    let newStatus;

    if (rows.length && String(rows[0].status).toUpperCase() === 'FECHADO') {
      fechamentoId = rows[0].id;
      oldStatus = 'FECHADO';
      newStatus = 'ABERTO';

      await connection.query(
        `UPDATE fechamentos_semanais
         SET status = 'ABERTO', fechado_em = NULL
         WHERE id = ?`,
        [fechamentoId]
      );
    } else {
      fechamentoId = rows.length ? rows[0].id : null;

      const [overlap] = await connection.query(
        `SELECT id FROM fechamentos_semanais
         WHERE status = 'FECHADO'
           AND data_inicio <= ?
           AND data_fim >= ?
           AND id <> ?
         LIMIT 1`,
        [endDate, startDate, fechamentoId || 0]
      );

      if (overlap.length) {
        await connection.rollback();
        return res.status(409).json({
          error: 'Esse período possui datas que já pertencem a outro fechamento.',
        });
      }

      if (!fechamentoId) {
        const [insert] = await connection.query(
          `INSERT INTO fechamentos_semanais
           (data_inicio, data_fim, status)
           VALUES (?, ?, 'ABERTO')`,
          [startDate, endDate]
        );
        fechamentoId = insert.insertId;
      }

      const [conflicts] = await connection.query(
        `SELECT COUNT(*) AS total FROM (
          SELECT fechamento_id FROM lancamentos_producao
          WHERE data BETWEEN ? AND ?
            AND fechamento_id IS NOT NULL AND fechamento_id <> ?
          UNION ALL
          SELECT fechamento_id FROM lancamentos_diaria
          WHERE data BETWEEN ? AND ?
            AND fechamento_id IS NOT NULL AND fechamento_id <> ?
          UNION ALL
          SELECT fechamento_id FROM faltas
          WHERE data BETWEEN ? AND ?
            AND fechamento_id IS NOT NULL AND fechamento_id <> ?
        ) AS conflitos`,
        [
          startDate, endDate, fechamentoId,
          startDate, endDate, fechamentoId,
          startDate, endDate, fechamentoId,
        ]
      );

      if (Number(conflicts[0].total) > 0) {
        await connection.rollback();
        return res.status(409).json({
          error: 'Existem lançamentos vinculados a outro fechamento nesse período.',
        });
      }

      const [prod] = await connection.query(
        `SELECT
           COALESCE(SUM(quantidade_caixas), 0) AS caixas,
           COALESCE(SUM(valor_total), 0) AS valor
         FROM lancamentos_producao WHERE data BETWEEN ? AND ?`,
        [startDate, endDate]
      );

      const [diarias] = await connection.query(
        `SELECT COALESCE(SUM(valor), 0) AS valor
         FROM lancamentos_diaria WHERE data BETWEEN ? AND ?`,
        [startDate, endDate]
      );

      const totalCaixas = Number(prod[0].caixas || 0);
      const totalProd = Number(prod[0].valor || 0);
      const totalDiarias = Number(diarias[0].valor || 0);

      await connection.query(
        `UPDATE fechamentos_semanais
         SET status = 'FECHADO',
             total_producao_caixas = ?,
             total_valor_producao = ?,
             total_valor_diarias = ?,
             total_a_pagar = ?,
             fechado_em = NOW()
         WHERE id = ?`,
        [totalCaixas, totalProd, totalDiarias, totalProd + totalDiarias, fechamentoId]
      );

      await connection.query(
        `UPDATE lancamentos_producao
         SET fechamento_id = ?
         WHERE data BETWEEN ? AND ? AND fechamento_id IS NULL`,
        [fechamentoId, startDate, endDate]
      );

      await connection.query(
        `UPDATE lancamentos_diaria
         SET fechamento_id = ?
         WHERE data BETWEEN ? AND ? AND fechamento_id IS NULL`,
        [fechamentoId, startDate, endDate]
      );

      await connection.query(
        `UPDATE faltas
         SET fechamento_id = ?
         WHERE data BETWEEN ? AND ? AND fechamento_id IS NULL`,
        [fechamentoId, startDate, endDate]
      );

      oldStatus = rows.length ? String(rows[0].status).toUpperCase() : 'ABERTO';
      newStatus = 'FECHADO';
    }

    await connection.commit();

    await registrarAuditoria({
      tabela: 'fechamentos_semanais',
      registroId: fechamentoId,
      campo: 'status',
      valorAnterior: oldStatus,
      valorNovo: newStatus,
      alteradoPor: 'Administrador da Fazenda',
      motivo: newStatus === 'FECHADO'
        ? `Período ${startDate} a ${endDate} fechado`
        : `Período ${startDate} a ${endDate} reaberto`,
    });

    const [updated] = await pool.query(
      'SELECT fechado_em FROM fechamentos_semanais WHERE id = ?',
      [fechamentoId]
    );

    res.json({
      id: fechamentoId,
      startDate,
      endDate,
      isClosed: newStatus === 'FECHADO',
      closedAt: updated[0]?.fechado_em
        ? toBrDateTime(updated[0].fechado_em)
        : undefined,
      closedBy: newStatus === 'FECHADO' ? 'Administrador da Fazenda' : undefined,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Erro ao alternar fechamento semanal:', error);
    res.status(500).json({ error: 'Erro ao atualizar fechamento da semana' });
  } finally {
    if (connection) connection.release();
  }
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor Backend rodando em http://127.0.0.1:${PORT}`);
});