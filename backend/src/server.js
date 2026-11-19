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

// ROTA 9: Consultar Estado do Fechamento da Semana
app.get('/api/week-closure', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM fechamentos_semanais ORDER BY id DESC LIMIT 1'
    );

    if (rows.length === 0) {
      return res.json({ isClosed: false });
    }

    const row = rows[0];
    const isClosed = String(row.status).toUpperCase() === 'FECHADO';

    res.json({
      id: row.id,
      period: `${toBrDate(row.data_inicio)} a ${toBrDate(row.data_fim)}`,
      isClosed,
      closedAt: row.fechado_em ? toBrDateTime(row.fechado_em) : undefined,
      closedBy: isClosed ? 'Administrador da Fazenda' : undefined,
    });
  } catch (error) {
    console.error('Erro ao consultar fechamento semanal:', error);
    res.status(500).json({ error: 'Erro ao consultar fechamento da semana' });
  }
});

// ROTA 10: Fechar / Reabrir Semana
app.post('/api/week-closure/toggle', async (req, res) => {
  try {
    const [prodRows] = await pool.query(
      'SELECT COALESCE(SUM(quantidade_caixas), 0) AS caixas, COALESCE(SUM(valor_total), 0) AS valorProd FROM lancamentos_producao'
    );
    const [diariaRows] = await pool.query(
      'SELECT COALESCE(SUM(valor), 0) AS valorDiarias FROM lancamentos_diaria'
    );
    const [caixRows] = await pool.query(
      'SELECT COALESCE(SUM(valor_recebido), 0) AS valorCaixeiros FROM carregamento_caixeiros'
    );

    const totalCaixas = Number(prodRows[0].caixas || 0);
    const totalProd = Number(prodRows[0].valorProd || 0);
    const totalDiarias = Number(diariaRows[0].valorDiarias || 0);
    const totalPagar = totalProd + totalDiarias + Number(caixRows[0].valorCaixeiros || 0);

    const [rows] = await pool.query(
      'SELECT * FROM fechamentos_semanais ORDER BY id DESC LIMIT 1'
    );

    let fechamentoId;
    let oldStatus = 'ABERTO';
    let newStatus = 'FECHADO';

    if (rows.length === 0) {
      const [insertRes] = await pool.query(
        `INSERT INTO fechamentos_semanais
          (data_inicio, data_fim, status, total_producao_caixas, total_valor_producao, total_valor_diarias, total_a_pagar, fechado_em)
         VALUES (DATE_SUB(CURDATE(), INTERVAL 7 DAY), CURDATE(), 'FECHADO', ?, ?, ?, ?, NOW())`,
        [totalCaixas, totalProd, totalDiarias, totalPagar]
      );
      fechamentoId = insertRes.insertId;
    } else {
      const current = rows[0];
      fechamentoId = current.id;
      oldStatus = String(current.status).toUpperCase();
      newStatus = oldStatus === 'FECHADO' ? 'ABERTO' : 'FECHADO';

      await pool.query(
        `UPDATE fechamentos_semanais
         SET status = ?,
             total_producao_caixas = ?,
             total_valor_producao = ?,
             total_valor_diarias = ?,
             total_a_pagar = ?,
             fechado_em = ${newStatus === 'FECHADO' ? 'NOW()' : 'NULL'}
         WHERE id = ?`,
        [newStatus, totalCaixas, totalProd, totalDiarias, totalPagar, fechamentoId]
      );
    }

    const isClosed = newStatus === 'FECHADO';

    await registrarAuditoria({
      tabela: 'fechamentos_semanais',
      registroId: fechamentoId,
      campo: 'status',
      valorAnterior: oldStatus,
      valorNovo: newStatus,
      alteradoPor: 'Administrador da Fazenda',
      motivo: isClosed
        ? `Semana fechada (${totalCaixas} caixas, R$ ${totalPagar.toFixed(2)})`
        : 'Semana reaberta para edição',
    });

    res.json({
      isClosed,
      closedAt: isClosed ? toBrDateTime(new Date()) : undefined,
      closedBy: isClosed ? 'Administrador da Fazenda' : undefined,
    });
  } catch (error) {
    console.error('Erro ao alternar fechamento semanal:', error);
    res.status(500).json({ error: 'Erro ao atualizar fechamento da semana' });
  }
});

// ROTA 11: Listar Histórico de Alterações (Auditoria)
app.get('/api/audit-logs', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM historico_alteracoes ORDER BY data_alteracao DESC, id DESC LIMIT 50'
    );

    const tabelaLabels = {
      lancamentos_producao: 'Produção',
      lancamentos_diaria: 'Diária',
      faltas: 'Falta',
      trabalhadores: 'Trabalhador',
      pagamentos: 'Pagamento',
      fechamentos_semanais: 'Fechamento Semanal',
    };

    const logs = rows.map((r) => {
      const label = tabelaLabels[r.tabela_afetada] || r.tabela_afetada;
      return {
        id: `audit_${r.id}`,
        date: toBrDate(r.data_alteracao),
        timestamp: toBrDateTime(r.data_alteracao),
        workerId: String(r.registro_id),
        workerName: label,
        changeTitle: `${label} • ${r.campo_alterado}`,
        previousValue: r.valor_anterior || 'Sem registro',
        newValue: r.valor_novo || '-',
        alteredBy: r.alterado_por || 'Sistema',
        reason: r.motivo || 'Alteração registrada no banco de dados',
      };
    });

    res.json(logs);
  } catch (error) {
    console.error('Erro ao listar auditoria:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico de alterações' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor Backend rodando em http://127.0.0.1:${PORT}`);
});