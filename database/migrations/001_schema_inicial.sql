-- =============================================================================
-- AGROTURMA - ESQUEMA DE BANCO DE DADOS
-- =============================================================================

-- 1. CONTROLE DE FECHAMENTO SEMANAL (Bloqueia alterações em semanas já fechadas)
CREATE TABLE IF NOT EXISTS fechamentos_semanais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTO', -- 'ABERTO' ou 'FECHADO'
    total_producao_caixas INT DEFAULT 0,
    total_valor_producao DECIMAL(10,2) DEFAULT 0.00,
    total_valor_diarias DECIMAL(10,2) DEFAULT 0.00,
    total_a_pagar DECIMAL(10,2) DEFAULT 0.00,
    fechado_em DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CADASTRO DE TRABALHADORES
CREATE TABLE IF NOT EXISTS trabalhadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) NULL,
    cpf VARCHAR(14) UNIQUE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo', -- 'ativo' ou 'inativo' (exclusão lógica)
    observacao TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. FUNÇÕES DE DIÁRIA (Apontador, Fiscal, Tratorista, etc.)
CREATE TABLE IF NOT EXISTS funcoes_diaria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE,
    valor_padrao DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. LANÇAMENTOS DE PRODUÇÃO (Quantidade de caixas por trabalhador no dia)
CREATE TABLE IF NOT EXISTS lancamentos_producao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trabalhador_id INT NOT NULL,
    fechamento_id INT NULL,
    data DATE NOT NULL,
    quantidade_caixas INT NOT NULL DEFAULT 0,
    valor_unitario_caixa DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) GENERATED ALWAYS AS (quantidade_caixas * valor_unitario_caixa) STORED,
    observacao TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trabalhador_id) REFERENCES trabalhadores(id) ON DELETE RESTRICT,
    FOREIGN KEY (fechamento_id) REFERENCES fechamentos_semanais(id) ON DELETE SET NULL
);

-- 5. LANÇAMENTOS DE DIÁRIAS
CREATE TABLE IF NOT EXISTS lancamentos_diaria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trabalhador_id INT NOT NULL,
    funcao_diaria_id INT NOT NULL,
    fechamento_id INT NULL,
    data DATE NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    observacao TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trabalhador_id) REFERENCES trabalhadores(id) ON DELETE RESTRICT,
    FOREIGN KEY (funcao_diaria_id) REFERENCES funcoes_diaria(id) ON DELETE RESTRICT,
    FOREIGN KEY (fechamento_id) REFERENCES fechamentos_semanais(id) ON DELETE SET NULL
);

-- 6. REGISTRO DE FALTAS E ATESTADOS
CREATE TABLE IF NOT EXISTS faltas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trabalhador_id INT NOT NULL,
    fechamento_id INT NULL,
    data DATE NOT NULL,
    motivo VARCHAR(100) NULL,
    possui_atestado BOOLEAN NOT NULL DEFAULT FALSE,
    desconta_financeiro BOOLEAN NOT NULL DEFAULT TRUE,
    observacao TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trabalhador_id) REFERENCES trabalhadores(id) ON DELETE RESTRICT,
    FOREIGN KEY (fechamento_id) REFERENCES fechamentos_semanais(id) ON DELETE SET NULL
);

-- 7. LOGÍSTICA DE CARREGAMENTO
CREATE TABLE IF NOT EXISTS carregamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fechamento_id INT NULL,
    data DATE NOT NULL,
    caminhao_identificador VARCHAR(100) NOT NULL,
    valor_por_caixa DECIMAL(10,2) NOT NULL,
    total_caixas INT NOT NULL DEFAULT 0,
    valor_total_carregamento DECIMAL(10,2) DEFAULT 0.00,
    observacao TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fechamento_id) REFERENCES fechamentos_semanais(id) ON DELETE SET NULL
);

-- Coletas realizadas ao longo do dia para o caminhão
CREATE TABLE IF NOT EXISTS coletas_carregamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carregamento_id INT NOT NULL,
    horario TIME NOT NULL,
    quantidade_caixas INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carregamento_id) REFERENCES carregamentos(id) ON DELETE CASCADE
);

-- Rateio de pagamento para os caixeiros que carregaram o caminhão
CREATE TABLE IF NOT EXISTS carregamento_caixeiros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carregamento_id INT NOT NULL,
    trabalhador_id INT NOT NULL,
    valor_recebido DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (carregamento_id) REFERENCES carregamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (trabalhador_id) REFERENCES trabalhadores(id) ON DELETE RESTRICT
);

-- 8. ÔNIBUS E FRETES
CREATE TABLE IF NOT EXISTS onibus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identificador_placa VARCHAR(50) NOT NULL,
    motorista_padrao_id INT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (motorista_padrao_id) REFERENCES trabalhadores(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS fretes_onibus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    onibus_id INT NOT NULL,
    motorista_id INT NOT NULL,
    data DATE NOT NULL,
    local_origem_destino VARCHAR(150) NOT NULL,
    valor_frete DECIMAL(10,2) NOT NULL,
    observacao TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (onibus_id) REFERENCES onibus(id) ON DELETE RESTRICT,
    FOREIGN KEY (motorista_id) REFERENCES trabalhadores(id) ON DELETE RESTRICT
);

-- 9. GESTÃO DE ÁREA: PLs E BECAS
CREATE TABLE IF NOT EXISTS pls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_identificador VARCHAR(50) NOT NULL,
    tipo_atividade ENUM('PLANTIO', 'CORTE') NOT NULL,
    status ENUM('EM_ANDAMENTO', 'FINALIZADO') NOT NULL DEFAULT 'EM_ANDAMENTO',
    observacao TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS becas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pl_id INT NOT NULL,
    numero_beca INT NOT NULL,
    metragem_metros DECIMAL(10,2) NOT NULL,
    data_medicao DATE NOT NULL,
    observacao TEXT NULL,
    FOREIGN KEY (pl_id) REFERENCES pls(id) ON DELETE CASCADE
);

-- 10. CONTROLE DE ENTREGA DE EPIS
CREATE TABLE IF NOT EXISTS epis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NULL
);

CREATE TABLE IF NOT EXISTS entregas_epi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trabalhador_id INT NOT NULL,
    epi_id INT NOT NULL,
    data_entrega DATE NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    observacao TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trabalhador_id) REFERENCES trabalhadores(id) ON DELETE RESTRICT,
    FOREIGN KEY (epi_id) REFERENCES epis(id) ON DELETE RESTRICT
);

-- 11. AUDITORIA: HISTÓRICO DE ALTERAÇÕES
CREATE TABLE IF NOT EXISTS historico_alteracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tabela_afetada VARCHAR(50) NOT NULL,
    registro_id INT NOT NULL,
    campo_alterado VARCHAR(50) NOT NULL,
    valor_anterior VARCHAR(255) NULL,
    valor_novo VARCHAR(255) NULL,
    alterado_por VARCHAR(100) NOT NULL,
    motivo VARCHAR(255) NULL,
    data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);