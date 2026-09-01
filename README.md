# 🌾 AgroTurma — Sistema de Gestão de Turma Rural

O **AgroTurma** é uma aplicação voltada para digitalizar o controle diário de trabalhadores rurais em lavouras (com foco inicial no cultivo e corte de alho), substituindo as anotações manuais em cadernos por uma gestão estruturada e relatórios rápidos.

---

## 🎯 Principais Funcionalidades

- **Gestão de Trabalhadores:** Cadastro rápido com controle de status (ativo/inativo via exclusão lógica).
- **Lançamento de Produção:** Apontamento diário de caixas colhidas e valores correspondentes.
- **Controle de Diárias e Funções:** Registro de apontadores, fiscais, tratoristas e diaristas com valores específicos.
- **Faltas e Atestados:** Gestão de ausências e controle de impacto no fechamento financeiro.
- **Logística e Caixeiros:** Registro de coletas por caminhão e rateio automático de carregamento.
- **Gestão de Transporte:** Controle de fretes de ônibus separado dos pagamentos dos motoristas.
- **Áreas e Medições:** Acompanhamento de talhões (PLs) e medição de becas.
- **Controle de EPIs:** Registro de entregas de equipamentos por trabalhador.
- **Fechamento e Relatórios:** Fechamento semanal com trava de edições e geração de relatório em PDF.

---

## 📁 Estrutura do Repositório

```text
agroturma/
├── .github/          # Modelos de Issues e Pull Requests
├── database/         # Modelagem relacional, migrations e dados de teste (seeds)
├── docs/             # Documentação de requisitos e protótipos de tela
├── mobile/           # Código-fonte do aplicativo móvel (Android / Offline-first)
├── backend/          # API e serviços de suporte
└── scripts/          # Scripts de automação e configuração