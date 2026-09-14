# 🚴‍♂️ CicloTrack Pro — GPS, Telemetria & Oficina 3D

> Aplicativo web progressivo (PWA) de alta precisão para ciclistas, integrando ciclocomputador GPS ao vivo, monitor cardíaco com gráficos em tempo real (Recharts), conexão Web Bluetooth (BLE), modelo 3D mecânico da bike (Three.js), manutenção preventiva e exportação GPX.

---

## 📋 Sumário
- [Recursos Principais](#-recursos-principais)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Tutorial Completo: Deploy no GitHub Pages (Sem Erros)](#-tutorial-completo-deploy-no-github-pages-sem-erros)
  - [Método 1: GitHub Actions (Recomendado / Padrão Oficial 2025/2026)](#método-1-github-actions-recomendado--padrão-oficial-20252026)
  - [Método 2: Linha de Comando com pacote `gh-pages`](#método-2-linha-de-comando-com-pacote-gh-pages)
  - [Prevenção de Problemas Comuns (Tela Branca, 404, Permissões)](#prevenção-de-problemas-comuns)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Licença](#-licença)

---

## 🌟 Recursos Principais

### 1. ⏱️ Ciclocomputador GPS & Painel Ativo
- **Métricas em tempo real:** Velocidade atual, média e máxima, distância percorrida, tempo decorrido, ganho de elevação acumulado e queima calórica (METs).
- **Mapa Dinâmico (Leaflet):** Traçado contínuo da rota percorrida, marcadores de início/posição e localização de oficinas e pontos de apoio próximos.
- **Simulador Biomecânico Integrado:** Permite testar e simular pedais diretamente no navegador sem precisar estar na rua.
- **Modo Economia de Bateria (AMOLED):** Tema escuro de alto contraste otimizado para poupar bateria do celular em pedais longos.

### 2. ❤️ Telemetria Cardíaca em Tempo Real (Recharts)
- **Gráfico de Área Dinâmico:** Visualização contínua das variações de BPM ao longo do treino com gradiente adaptativo.
- **Zonas Fisiológicas Cardíacas (Z1 a Z5):**
  - **Z1:** Recuperação Ativa (< 115 BPM)
  - **Z2:** Aeróbico de Base (115 - 134 BPM)
  - **Z3:** Tempo / Ritmo (135 - 153 BPM)
  - **Z4:** Limiar de Lactato (154 - 172 BPM)
  - **Z5:** Anaeróbico / Pico Máximo (> 173 BPM)
- **Linhas de Referência Fisiológicas:** Marcadores visuais claros para limiar de treino e esforço pico.
- **Barra de Distribuição de Esforço:** Percentual de tempo gasto em cada zona fisiológica.
- **Suporte a Web Bluetooth API:** Conexão nativa sem fio com cintas cardíacas BLE (Polar H10/H9, Garmin HRM, Wahoo TICKR, Magene, CooSpo).

### 3. 🛠️ Oficina Virtual & Modelo 3D da Bicicleta (Three.js)
- **Gêmeo Digital 3D:** Modelo interativo com rotação orbital 360°, zoom e modo Raio-X.
- **Saúde dos Componentes:** Monitoramento preditivo de desgaste de corrente, pastilhas de freio, pneus, suspensão e cassete baseado em km rodados.
- **Alertas de Manutenção Preventiva:** Notificações de lubrificação, alinhamento e troca de peças.

### 4. 🗺️ Rotas, Histórico & Exportação
- Exportação instantânea de arquivos `.GPX` e `.TCX` para Strava, Garmin Connect, TrainingPeaks e Komoot.
- Integração e compartilhamento social de conquistas e recordes de distância/velocidade.

---

## 💻 Tecnologias Utilizadas

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vite.dev/) (Compilação ultrarrápida e suporte nativo a ESM)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Visualização de Dados:** [Recharts](https://recharts.org/) (Gráficos SVG reativos)
- **Mapas & Geometria:** [Leaflet](https://leafletjs.com/)
- **Renderização 3D:** [Three.js](https://threejs.org/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Animações:** [Motion](https://motion.dev/)
- **Deploy:** GitHub Actions (`actions/deploy-pages@v4`) + `gh-pages`

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior
- Gerenciador de pacotes `npm`, `yarn` ou `pnpm`

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/<seu-usuario>/<seu-repositorio>.git
cd <seu-repositorio>
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra no navegador:
```text
http://localhost:3000
```

5. Para validar erros de tipagem TypeScript:
```bash
npm run lint
```

---

## 🌐 Tutorial Completo: Deploy no GitHub Pages (Sem Erros)

O deploy foi configurado seguindo as **melhores práticas oficiais de 2025/2026** recomendadas pela equipe do Vite e pelo GitHub.

### Por que esta configuração não dá erro?
1. **Base configurada com caminho relativo (`./`) no `vite.config.ts`:** Evita o erro clássico de "tela branca" em que o navegador busca `/assets/...` na raiz do domínio em vez de `/nome-do-repositorio/assets/...`.
2. **Workflow nativo do GitHub Actions (`.github/workflows/deploy.yml`):** Utiliza as actions oficiais `actions/upload-pages-artifact@v3` e `actions/deploy-pages@v4`.
3. **Arquivo `404.html` incluso na pasta `public/`:** Garante que recarregamentos de página (F5) não resultem na tela de erro padrão 404 do GitHub.

---

### Método 1: GitHub Actions (Recomendado / Padrão Oficial 2025/2026)

Este é o método mais moderno, seguro e automatizado. Toda vez que você enviar um `git push` para a branch principal, o GitHub compilará e publicará o site sozinho.

#### Passo 1: Habilitar o GitHub Actions no repositório
1. Abra o seu repositório no GitHub.
2. Clique na aba superior **Settings** (Configurações).
3. No menu lateral esquerdo, clique em **Pages** (dentro da seção *Code and automation*).
4. Na seção **Build and deployment**, localize o campo **Source** (Fonte).
5. Mude a seleção de *"Deploy from a branch"* para:
   👉 **`GitHub Actions`**

#### Passo 2: Fazer o Push para o GitHub
O arquivo de automação já está criado em `.github/workflows/deploy.yml`. Basta enviar seu código para o GitHub:

```bash
git add .
git commit -m "feat: configuracao github pages e readme"
git push origin main
```
*(Se sua branch principal chamar `master`, o workflow também roda automaticamente)*.

#### Passo 3: Acompanhar o Deploy
1. No seu repositório no GitHub, clique na aba **Actions**.
2. Você verá o fluxo **Deploy to GitHub Pages** rodando.
3. Ao finalizar (aproximadamente 1 minuto), a URL do seu site estará disponível na própria página do GitHub Pages ou no topo da aba Actions!
   - Exemplo de URL: `https://<seu-usuario>.github.io/<nome-do-repositorio>/`

---

### Método 2: Linha de Comando com pacote `gh-pages`

Se você preferir fazer o build e publicação manual diretamente do seu terminal, o script já está configurado no `package.json`:

1. No seu repositório no GitHub, vá em **Settings > Pages**.
2. Em **Source**, selecione **Deploy from a branch**.
3. No seu terminal local, execute:
```bash
npm run deploy
```
4. Este comando executará automaticamente:
   - `predeploy`: Compila os arquivos para a pasta `/dist` (`npm run build`).
   - `deploy`: Faz o push da pasta `/dist` diretamente para o branch `gh-pages`.
5. Em **Settings > Pages**, certifique-se de que a branch selecionada seja `gh-pages` e a pasta seja `/ (root)`.

---

### 🛡️ Prevenção de Problemas Comuns

| Sintoma / Erro | Causa Comum | Como o projeto já resolve |
|---|---|---|
| **Tela branca após deploy (Failed to load resource: 404)** | O Vite gerou caminhos absolutos (`/assets/index.js`) em vez de relativos ao subdiretório do repositório. | No `vite.config.ts`, a propriedade `base` está definida como `process.env.VITE_BASE_URL \|\| './'`, garantindo caminhos relativos perfeitos em qualquer repositório. |
| **Erro de permissão no Actions: `Permission denied to github-actions[bot]`** | As permissões do token do repositório estão como somente leitura. | O workflow `.github/workflows/deploy.yml` declara explicitamente `permissions: { pages: write, id-token: write, contents: read }`. Se necessário, confirme em **Settings > Actions > General > Workflow permissions** marcando *"Read and write permissions"*. |
| **Erro 404 ao atualizar página** | GitHub Pages procura um arquivo físico para a rota. | O arquivo `/public/404.html` captura requisições de rotas e redireciona de volta para o app sem perder o contexto. |
| **Conflito de builds simultâneos** | Múltiplos commits rápidos geram concorrência. | O workflow usa `concurrency: { group: 'pages', cancel-in-progress: true }`. |

---

## 📂 Estrutura do Projeto

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow de CI/CD para GitHub Pages
├── public/
│   ├── 404.html                # Redirecionamento SPA para GitHub Pages
│   └── assets/                 # Imagens e modelos estáticos
├── src/
│   ├── components/
│   │   ├── DashboardRide.tsx   # Ciclocomputador ao vivo + Mapa + Controles
│   │   ├── HeartRateLiveChart.tsx # Gráfico de telemetria em tempo real (Recharts)
│   │   ├── BikeModel3D.tsx     # Visualizador 3D interativo da bike (Three.js)
│   │   ├── MaintenanceChecklist.tsx # Diagnóstico e vida útil de peças
│   │   ├── RouteMap.tsx        # Visualizador de mapas e trilhas
│   │   └── SocialFeed.tsx      # Atividades e integração Strava
│   ├── utils/
│   │   ├── geo.ts              # Cálculos GPS, distâncias e zonas cardíacas
│   │   └── audio.ts            # Chimes e alertas sonoros de treino
│   ├── types.ts                # Definições de tipos TypeScript
│   ├── App.tsx                 # Layout principal e abas de navegação
│   └── main.tsx                # Ponto de entrada React
├── package.json                # Scripts e dependências (inclui gh-pages)
├── vite.config.ts              # Configuração Vite com base relativa para GitHub Pages
└── README.md                   # Documentação completa
```

---

## 📄 Licença

Este projeto é disponibilizado sob a licença MIT. Sinta-se livre para usar, estudar, modificar e compartilhar!
