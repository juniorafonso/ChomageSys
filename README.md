# Système de Calcul des Prestations Chômage / Sistema de Cálculo de Seguro-Desemprego

Sistema web multilíngue para calcular benefícios de desemprego (chômage) com interface intuitiva e cálculos automáticos.

## 🌍 Idiomas Suportados

- **🇫🇷 Français** (França) - **Padrão**
- **🇧🇷 Português** (Brasil)
- **🇺🇸 English** (Estados Unidos)
- **🇩🇪 Deutsch** (Alemanha)
- **🇮🇹 Italiano** (Itália)
- **🇪🇸 Español** (Espanha)

## 📋 Funcionalidades

- **Interface multilíngue**: Suporte completo a 6 idiomas
- **Seletor de idioma**: Mudança instantânea de idioma
- **Persistência**: Idioma salvo automaticamente no navegador
- **Interface intuitiva**: Campos configuráveis para todos os parâmetros
- **Cálculos automáticos**: Resultado instantâneo com breakdown detalhado
- **Valores configuráveis**: Todos os parâmetros podem ser ajustados
- **Tabela detalhada**: Mostra cada etapa do cálculo
- **Design responsivo**: Funciona em desktop e mobile

## 🎯 Parâmetros Base (Constantes do Sistema)

- **Média anual de trabalho**: 21.7 dias (para cálculo da indemnité journalière)
- **Allocation familiale**: CHF 311.00 por criança por mês
- **Gain assuré máximo**: CHF 12'350 por mês

## 📊 Taxas de Dedução

- **AVS/AI/APG**: 5.300% (sobre indemnité base)
- **LAA**: 2.470% (sobre indemnité base)
- **LPP (Prévoyance Professionnelle)**: Cálculo complexo baseado em seuils de salário
- **Ass. perte de gain**: 3.75% (sobre gain assuré × 80%)

## 🧮 Fórmulas de Cálculo

### Cálculos Base
```
Indemnité journalière = (gain assuré × taxa compensação) ÷ 21.7 dias (média anual)
Indemnité mensuelle brute = indemnité journalière × jours controlados (mês específico)
Allocations enfants = (CHF 311.00 ÷ 21.7) × jours controlados × número de filhos
Total bruto = indemnité mensuelle + allocations enfants
```

### Deduções
```
AVS/AI/APG = 5.300% × indemnité mensuelle brute
LAA = 2.470% × indemnité mensuelle brute
LPP = Cálculo baseado em seuils salariais (ver detalhes abaixo)
Ass. perte de gain = gain assuré × 80% × 3.75%
```

### Cálculo LPP (Prévoyance Professionnelle)
O cálculo LPP é complexo e baseado em seuils de salário journalier:

**Constantes:**
- Montant de coordination: CHF 101.60/jour
- Salaire minimum LPP: CHF 87.10/jour  
- Salaire seuil LPP: CHF 116.10/jour
- Partie assurable minimum: CHF 14.50/jour
- Salaire maximum LPP: CHF 348.35/jour
- Taux de cotisation: 0.25% par jour

**Règles de calcul:**
1. **Si salaire < CHF 87.10/jour:** Pas de cotisation LPP
2. **Si CHF 87.10 ≤ salaire ≤ CHF 116.10:** Partie assurable = CHF 14.50 (fixe)
3. **Si salaire > CHF 116.10:** Partie assurable = min(salaire, CHF 348.35) - CHF 101.60

**Formule finale:**
```
LPP = (Partie assurable × jours effectifs × 0.25%) ÷ 2
```

**Note importante:** Les jours effectifs = jours contrôlés - délai d'attente (pour le premier mois)

### Resultado Final
```
Net = Brut - (AVS/AI/APG + LAA + LPP + Ass. perte de gain)

Onde:
- AVS/AI/APG = indemnité base × 5.3%
- LAA = indemnité base × 2.47%  
- LPP = Cálculo complexo baseado em seuils (ver acima)
- Ass. perte de gain = gain assuré × 80% × 3.75%
```

## 🚀 Como Usar o Sistema Wizard

O sistema agora utiliza um wizard em 4 etapas para facilitar o cálculo:

### Etapa 1: 💰 Cálculo do Gain Assuré
Três métodos disponíveis:
1. **Entrada manual:** Digite salários mês a mês (1er mois, 2ème mois, etc.) + 13º salário
2. **Valor total:** Informe o total dos últimos 12 meses
3. **Média conhecida:** Se já souber a média mensal

**Limite máximo:** CHF 12'350/mês (aplicado automaticamente)

### Etapa 2: 👨‍👩‍👧‍👦 Situação Pessoal
Perguntas que determinam taxa de compensação (70% ou 80%) e délai d'attente:
- Filhos < 25 anos dependentes?
- Rente d'invalidité (≥40%)?
- Assurance perte de gain?
- Primeiro mês de chômage?

### Etapa 3: 🧮 Parâmetros de Cálculo
Visualização dos parâmetros calculados + input para o mês específico:
- **Taxa de compensação:** Calculada automaticamente (70% ou 80%)
- **Indemnité journalière:** Baseada na média anual (21.7 dias)
- **Délai d'attente:** Calculado automaticamente
- **Jours contrôlés:** Número de dias para este mês específico (input do usuário)

### Etapa 4: 📊 Resultados Detalhados
Tabela completa com:
- Indemnité brute mensal
- Todas as deduções (AVS/AI/APG, LAA, LPP, PCM)
- Allocations familiales
- **Total net mensal final**

## 🌍 Suporte Multilíngue

- **Français** 🇫🇷 (idioma padrão)
- **Português** 🇧🇷 
- **English** 🇬🇧
- **Deutsch** 🇩🇪
- **Italiano** 🇮🇹
- **Español** 🇪🇸

## 📁 Estrutura do Projeto

```
ChomageSys/
├── index.html          # Interface principal
├── styles.css          # Estilos e design responsivo
├── calculator.js       # Lógica de cálculo e interações
├── translations.js     # Sistema de tradução e idiomas
└── README.md          # Documentação
```

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura da página
- **CSS3**: Estilos modernos com gradientes e animações
- **JavaScript ES6+**: Lógica de cálculo orientada a objetos
- **Sistema i18n**: Internacionalização com 6 idiomas
- **LocalStorage**: Persistência de preferências do usuário
- **Design Responsivo**: Mobile-first approach

## 🌍 Sistema de Internacionalização

### Idiomas Disponíveis
- **Português (PT)**: Interface completa em português brasileiro
- **English (EN)**: Full English interface
- **Français (FR)**: Interface complète en français
- **Deutsch (DE)**: Vollständige deutsche Oberfläche
- **Italiano (IT)**: Interfaccia completa in italiano
- **Español (ES)**: Interfaz completa en español

### Funcionalidades i18n
- **Mudança instantânea**: Troca de idioma sem recarregar a página
- **Persistência**: Idioma salvo no navegador (localStorage)
- **Traduções completas**: Todos os textos, labels e mensagens traduzidos
- **Formato de moeda**: CHF (Franco Suíço) em todos os idiomas

## 🎨 Características do Design

- **Gradientes modernos**: Visual atrativo com cores profissionais
- **Cards flutuantes**: Interface limpa e organizada
- **Seletor de idioma**: Design elegante com bandeiras
- **Animações suaves**: Transições e efeitos hover
- **Responsivo**: Adaptável a diferentes tamanhos de tela
- **Tipografia clara**: Fácil leitura e navegação

## 🔧 Funcionalidades Técnicas

### ChomageCalculator Class
- Gerenciamento de parâmetros configuráveis
- Cálculos precisos com arredondamento monetário
- Formatação de moeda suíça (CHF)
- Validação de entrada

### Sistema de Traduções
- Arquivo centralizado de traduções (translations.js)
- Função `t()` para obter textos traduzidos
- Atualização dinâmica da interface
- Fallback para inglês se tradução não encontrada

### Interface Interativa
- Recálculo automático ao alterar parâmetros
- Atalho de teclado (Enter) para calcular
- Animações de entrada para resultados
- Scroll automático para resultados

### Validações
- Verificação de números válidos
- Tratamento de erros multilíngue
- Mensagens de feedback ao usuário

## 📱 Uso Multi-plataforma

### Desktop
1. Abra `index.html` em qualquer navegador moderno
2. Selecione seu idioma preferido
3. Configure os parâmetros desejados
4. Insira os jours contrôlés
5. Visualize os resultados detalhados

### Mobile
- Interface totalmente responsiva
- Touch-friendly
- Seletor de idioma adaptado
- Tabelas com scroll horizontal quando necessário

## 🎯 Exemplo de Cálculo Detalhado

**Cenário**: Gain assuré CHF 6'000, 15 jours contrôlés, 2 filhos, primeiro mês com 5 dias d'attente

**Cálculos**:
1. **Taux d'indemnisation**: 80% (tem filhos)
2. **Indemnité journalière**: CHF 6'000 × 80% ÷ 21.7 = CHF 221.20
3. **Indemnité brute**: CHF 221.20 × 15 = CHF 3'318.00

**Deduções**:
- **AVS/AI/APG**: CHF 3'318.00 × 5.3% = CHF 175.85
- **LAA**: CHF 3'318.00 × 2.47% = CHF 81.95
- **LPP**: (CHF 119.60 × 10 jours efetivos × 0.25%) ÷ 2 = CHF 1.50
  - *Jours efetivos: 15 - 5 délai = 10 jours*
  - *Partie assurable: CHF 221.20 - CHF 101.60 = CHF 119.60*
- **Total deduções**: CHF 259.30

**Allocations**:
- **Enfants**: 2 × (CHF 311.00 ÷ 21.7) × 15 = CHF 430.04

**Resultado Final**:
- **Indemnité nette**: CHF 3'318.00 - CHF 259.30 = CHF 3'058.70
- **Total net mensal**: CHF 3'058.70 + CHF 430.04 = **CHF 3'488.74**

## 🔮 Possíveis Melhorias Futuras

- [ ] Modo escuro/claro
- [ ] Mais idiomas (Romanche, Chinês, Árabe)
- [ ] Exportar resultados em PDF multilíngue
- [ ] Histórico de cálculos
- [ ] Múltiplos perfis de configuração
- [ ] Gráficos de evolução temporal
- [ ] API para integração com outros sistemas
- [ ] PWA (Progressive Web App)

## 📄 Licença

Este projeto é de uso livre para fins educacionais e profissionais.

---

**Desenvolvido com JavaScript puro - Sistema multilíngue completo**
