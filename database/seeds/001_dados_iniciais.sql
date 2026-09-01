-- =============================================================================
-- AGROTURMA - DADOS INICIAIS DE TESTE (SEEDS)
-- =============================================================================

-- 1. Funções de Diária Padrão
INSERT INTO funcoes_diaria (nome, valor_padrao, ativo) VALUES 
('Apontador(a)', 100.00, TRUE),
('Fiscal', 90.00, TRUE),
('Tratorista', 110.00, TRUE),
('Diarista da Roça', 80.00, TRUE),
('Faxineira', 70.00, TRUE);

-- 2. Trabalhadores (Baseados no protótipo)
INSERT INTO trabalhadores (nome, telefone, cpf, status, observacao) VALUES 
('João da Silva', '(34) 99999-1111', '111.111.111-01', 'ativo', 'Trabalhador experiente em corte'),
('Maria Aparecida', '(34) 99999-2222', '222.222.222-02', 'ativo', 'Atua em produção e diária'),
('Pedro Henrique', '(34) 99999-3333', '333.333.333-03', 'ativo', NULL),
('José Carlos', '(34) 99999-4444', '444.444.444-04', 'inativo', 'Inativado temporariamente'),
('Ana Paula', '(34) 99999-5555', '555.555.555-05', 'ativo', NULL),
('Lucas Soares', '(34) 99999-6666', '666.666.666-06', 'inativo', NULL),
('Ronaldo Alves', '(34) 99999-7777', '777.777.777-07', 'ativo', NULL),
('Fernanda Lima', '(34) 99999-8888', '888.888.888-08', 'ativo', NULL);

-- 3. EPIs Comuns no Campo
INSERT INTO epis (nome, descricao) VALUES 
('Luva de Vaqueta', 'Proteção para corte e manuseio de caixas'),
('Óculos de Proteção', 'Lente incolor com proteção UV'),
('Perneira de Segurança', 'Proteção inferior contra cortes e animais peçonhentos'),
('Chapéu de Palha com Aba', 'Proteção solar para lavoura');

-- 4. Talhões / PLs Iniciais
INSERT INTO pls (codigo_identificador, tipo_atividade, status, observacao) VALUES 
('PL 01 - Gleba Norte', 'CORTE', 'EM_ANDAMENTO', 'Área de alho roxo'),
('PL 02 - Gleba Sul', 'PLANTIO', 'EM_ANDAMENTO', 'Preparação para próxima safra');

-- 5. Ônibus da Turma
INSERT INTO onibus (identificador_placa, motorista_padrao_id, ativo) VALUES 
('Ônibus 01 - ABC-1234', 1, TRUE),
('Ônibus 02 - XYZ-5678', 3, TRUE);

-- 6. Fechamento Semanal de Teste (09/06/2025 a 15/06/2025)
INSERT INTO fechamentos_semanais (data_inicio, data_fim, status, total_producao_caixas, total_valor_producao, total_valor_diarias, total_a_pagar) VALUES 
('2025-06-09', '2025-06-15', 'ABERTO', 1025, 5125.00, 1220.00, 6345.00);

-- 7. Lançamentos de Produção de Exemplo (15/06/2025)
INSERT INTO lancamentos_producao (trabalhador_id, fechamento_id, data, quantidade_caixas, valor_unitario_caixa, observacao) VALUES 
(1, 1, '2025-06-15', 18, 5.00, 'Produção normal corte de alho'),
(2, 1, '2025-06-15', 15, 5.00, NULL),
(3, 1, '2025-06-15', 20, 5.00, NULL);

-- 8. Lançamento de Diária de Exemplo (15/06/2025)
INSERT INTO lancamentos_diaria (trabalhador_id, funcao_diaria_id, fechamento_id, data, valor, observacao) VALUES 
(2, 4, 1, '2025-06-15', 80.00, 'Diarista da Roça');

-- 9. Lançamento de Falta de Exemplo (15/06/2025)
INSERT INTO faltas (trabalhador_id, fechamento_id, data, motivo, possui_atestado, desconta_financeiro, observacao) VALUES 
(3, 1, '2025-06-15', 'Não compareceu', FALSE, TRUE, 'Falta sem justificativa prévia');