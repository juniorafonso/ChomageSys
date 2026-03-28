// Sistema de Cálculo de Chômage com Wizard
class ChomageWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.data = {
            gainAssured: 0,
            compensationRate: 70,
            dailyAllowance: 0,
            waitingPeriod: 0,
            hasChildren: false,
            numChildren: 0,
            hasDisabilityPension: false,
            hasLossInsurance: false,
            isFirstMonth: true,
            controlledDays: 21.70,
            childAllowanceMonthly: 311.00
        };
        
        this.initializeEventListeners();
        this.updateCalculationMethod();
    }

    initializeEventListeners() {
        // Listeners para método de cálculo
        document.querySelectorAll('input[name="calculation-method"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateCalculationMethod());
        });

        // Listeners para inputs de salário
        for (let i = 1; i <= 12; i++) {
            const input = document.getElementById(`salary-${i}`);
            if (input) {
                input.addEventListener('input', () => this.calculateGainFromManual());
            }
        }
        
        document.getElementById('thirteenth-salary')?.addEventListener('input', () => this.calculateGainFromManual());
        document.getElementById('total-12-months')?.addEventListener('input', () => this.calculateGainFromTotal());
        document.getElementById('monthly-average')?.addEventListener('input', () => this.calculateGainFromAverage());

        // Listeners para situação pessoal
        document.querySelectorAll('input[name="has-children"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateChildrenVisibility());
        });

        // Listeners para todas as perguntas que afetam o cálculo
        ['has-children', 'disability-pension', 'loss-insurance', 'first-month'].forEach(name => {
            document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
                radio.addEventListener('change', () => this.updatePersonalSituation());
            });
        });

        document.getElementById('num-children')?.addEventListener('input', () => this.updatePersonalSituation());
    }

    updateCalculationMethod() {
        const method = document.querySelector('input[name="calculation-method"]:checked')?.value;
        
        // Esconder todos os métodos
        document.querySelectorAll('.calculation-method').forEach(div => {
            div.classList.remove('active');
        });

        // Mostrar método selecionado
        const activeMethod = document.getElementById(`${method}-input`);
        if (activeMethod) {
            activeMethod.classList.add('active');
        }

        // Calcular gain baseado no método
        this.calculateGainBasedOnMethod();
    }

    calculateGainBasedOnMethod() {
        const method = document.querySelector('input[name="calculation-method"]:checked')?.value;
        
        switch (method) {
            case 'manual':
                this.calculateGainFromManual();
                break;
            case 'total':
                this.calculateGainFromTotal();
                break;
            case 'average':
                this.calculateGainFromAverage();
                break;
        }
    }

    calculateGainFromManual() {
        let total = 0;
        
        // Somar salários dos 12 meses
        for (let i = 1; i <= 12; i++) {
            const salary = parseFloat(document.getElementById(`salary-${i}`)?.value || 0);
            total += salary;
        }
        
        // Adicionar 13º salário
        const thirteenth = parseFloat(document.getElementById('thirteenth-salary')?.value || 0);
        total += thirteenth;
        
        // Calcular média mensal
        let gainAssured = total / 12;
        
        // Aplicar limite máximo de CHF 12'350
        gainAssured = Math.min(gainAssured, 12350);
        
        this.data.gainAssured = gainAssured;
        this.updateGainDisplay();
    }

    calculateGainFromTotal() {
        const total = parseFloat(document.getElementById('total-12-months')?.value || 0);
        
        // Calcular média mensal e aplicar limite máximo
        let gainAssured = total / 12;
        gainAssured = Math.min(gainAssured, 12350);
        
        this.data.gainAssured = gainAssured;
        this.updateGainDisplay();
    }

    calculateGainFromAverage() {
        const average = parseFloat(document.getElementById('monthly-average')?.value || 0);
        
        // Aplicar limite máximo de CHF 12'350
        const gainAssured = Math.min(average, 12350);
        
        this.data.gainAssured = gainAssured;
        this.updateGainDisplay();
    }

    updateGainDisplay() {
        const displayElement = document.getElementById('calculated-gain-amount');
        if (displayElement) {
            displayElement.textContent = this.formatCurrency(this.data.gainAssured);
            
            // Verificar se o limite foi aplicado e mostrar aviso
            const originalValue = this.getOriginalGainValue();
            if (originalValue > 12350) {
                this.showMaxLimitWarning(originalValue);
            } else {
                this.hideMaxLimitWarning();
            }
        }
    }

    getOriginalGainValue() {
        const method = document.querySelector('input[name="calculation-method"]:checked')?.value;
        
        switch (method) {
            case 'manual':
                let total = 0;
                for (let i = 1; i <= 12; i++) {
                    const salary = parseFloat(document.getElementById(`salary-${i}`)?.value || 0);
                    total += salary;
                }
                const thirteenth = parseFloat(document.getElementById('thirteenth-salary')?.value || 0);
                return (total + thirteenth) / 12;
            case 'total':
                const totalAmount = parseFloat(document.getElementById('total-12-months')?.value || 0);
                return totalAmount / 12;
            case 'average':
                return parseFloat(document.getElementById('monthly-average')?.value || 0);
            default:
                return 0;
        }
    }

    showMaxLimitWarning(originalValue) {
        let warningElement = document.getElementById('max-limit-warning');
        if (!warningElement) {
            warningElement = document.createElement('div');
            warningElement.id = 'max-limit-warning';
            warningElement.className = 'max-limit-warning';
            
            const gainResultContainer = document.querySelector('.calculated-gain');
            if (gainResultContainer) {
                gainResultContainer.appendChild(warningElement);
            }
        }
        
        warningElement.innerHTML = `
            <h4>⚠️ ${t('maxLimitApplied') || 'Limite Maximum Appliqué'}</h4>
            <p>${t('maxLimitWarning') || 'Votre gain calculé était de'} <strong>${this.formatCurrency(originalValue)}</strong></p>
            <p>${t('maxLimitExplanation') || 'Le gain assuré maximum accepté par l\'assurance chômage est de CHF 12\'350.- par mois.'}</p>
            <p>${t('maxLimitCalculation') || 'Vos indemnités seront calculées sur la base de CHF 12\'350.-'}</p>
        `;
        warningElement.style.display = 'block';
    }

    hideMaxLimitWarning() {
        const warningElement = document.getElementById('max-limit-warning');
        if (warningElement) {
            warningElement.style.display = 'none';
        }
    }

    updateChildrenVisibility() {
        const hasChildren = document.querySelector('input[name="has-children"]:checked')?.value === 'yes';
        const childrenCount = document.getElementById('children-count');
        
        if (childrenCount) {
            childrenCount.style.display = hasChildren ? 'block' : 'none';
            if (!hasChildren) {
                document.getElementById('num-children').value = 0;
            }
        }
        
        this.updatePersonalSituation();
    }

    updatePersonalSituation() {
        // Atualizar dados
        this.data.hasChildren = document.querySelector('input[name="has-children"]:checked')?.value === 'yes';
        this.data.numChildren = parseInt(document.getElementById('num-children')?.value || 0);
        this.data.hasDisabilityPension = document.querySelector('input[name="disability-pension"]:checked')?.value === 'yes';
        this.data.hasLossInsurance = document.querySelector('input[name="loss-insurance"]:checked')?.value === 'yes';
        this.data.isFirstMonth = document.querySelector('input[name="first-month"]:checked')?.value === 'yes';

        // Calcular taxa de compensação
        this.calculateCompensationRate();
        
        // Calcular indemnité journalière
        this.calculateDailyAllowance();
        
        // Calcular délai d'attente
        this.calculateWaitingPeriod();
    }

    calculateCompensationRate() {
        // Taxa base é 70%
        let rate = 70;
        
        // Casos para 80%:
        // 1. Pelo menos um filho < 25 anos
        if (this.data.hasChildren && this.data.numChildren > 0) {
            rate = 80;
        }
        // 2. Rente d'invalidité avec taux >= 40%
        else if (this.data.hasDisabilityPension) {
            rate = 80;
        }
        // 3. Gain assuré <= CHF 3797
        else if (this.data.gainAssured <= 3797) {
            rate = 80;
        }
        
        this.data.compensationRate = rate;
        
        // Atualizar display
        const display = document.getElementById('compensation-rate');
        if (display) {
            display.textContent = `${rate}%`;
        }
    }

    calculateDailyAllowance() {
        if (this.data.gainAssured > 0) {
            const controlledDays = parseFloat(document.getElementById('controlled-days')?.value || 21.70);
            this.data.dailyAllowance = (this.data.gainAssured * this.data.compensationRate / 100) / controlledDays;
            
            // Verificar se indemnité <= CHF 140 (caso para 80%)
            if (this.data.dailyAllowance <= 140 && this.data.compensationRate === 70) {
                this.data.compensationRate = 80;
                this.data.dailyAllowance = (this.data.gainAssured * 80 / 100) / controlledDays;
                
                // Atualizar display da taxa
                const rateDisplay = document.getElementById('compensation-rate');
                if (rateDisplay) {
                    rateDisplay.textContent = '80%';
                }
            }
            
            // Atualizar display
            const display = document.getElementById('daily-allowance-calc');
            if (display) {
                display.textContent = this.formatCurrency(this.data.dailyAllowance);
            }
        }
    }

    calculateWaitingPeriod() {
        let waitingDays = 0;
        
        if (this.data.isFirstMonth && this.data.gainAssured > 0) {
            // Tabela de délai d'attente
            if (this.data.gainAssured >= 500 && this.data.gainAssured <= 3000) {
                waitingDays = 0; // Para todos
            } else if (this.data.gainAssured >= 3001 && this.data.gainAssured <= 5000) {
                waitingDays = this.data.hasChildren && this.data.numChildren > 0 ? 0 : 5;
            } else if (this.data.gainAssured >= 5001 && this.data.gainAssured <= 7500) {
                waitingDays = this.data.hasChildren && this.data.numChildren > 0 ? 5 : 10;
            } else if (this.data.gainAssured >= 7501 && this.data.gainAssured <= 10416) {
                waitingDays = this.data.hasChildren && this.data.numChildren > 0 ? 5 : 15;
            } else if (this.data.gainAssured >= 10417 && this.data.gainAssured <= 12350) {
                waitingDays = this.data.hasChildren && this.data.numChildren > 0 ? 5 : 20;
            }
        }
        
        this.data.waitingPeriod = waitingDays;
        
        // Atualizar display
        const display = document.getElementById('waiting-period');
        if (display) {
            display.textContent = `${waitingDays} jours`;
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateStepDisplay();
                this.updateStepIndicator();
                
                // Se chegou na etapa 3, calcular parâmetros
                if (this.currentStep === 3) {
                    this.updatePersonalSituation();
                }
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.updateStepIndicator();
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                if (this.data.gainAssured <= 0) {
                    alert(t('pleaseCalculateGain') || 'Veuillez calculer votre gain assuré avant de continuer.');
                    return false;
                }
                break;
            case 2:
                // Todas as perguntas são obrigatórias, mas têm valores padrão
                break;
        }
        return true;
    }

    updateStepDisplay() {
        // Esconder todas as etapas
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.remove('active');
        });

        // Mostrar etapa atual
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }
    }

    updateStepIndicator() {
        for (let i = 1; i <= this.totalSteps; i++) {
            const indicator = document.getElementById(`step-indicator-${i}`);
            if (indicator) {
                indicator.classList.remove('active', 'completed');
                
                if (i < this.currentStep) {
                    indicator.classList.add('completed');
                } else if (i === this.currentStep) {
                    indicator.classList.add('active');
                }
            }
        }
    }

    calculateFinalResults() {
        const controlledDays = parseFloat(document.getElementById('controlled-days')?.value || 21.70);
        this.data.controlledDays = controlledDays;
        this.data.childAllowanceMonthly = parseFloat(document.getElementById('child-allowance')?.value || 311.00);
        
        // Recalcular tudo com os parâmetros finais
        this.calculateDailyAllowance();
        
        this.generateFinalResults();
        this.nextStep();
    }

    calculateLPPDeduction(dailySalary, numberOfDays) {
        // Constantes LPP
        const MONTANT_COORDINATION = 101.60;
        const TAUX_LPP = 0.0025; // 0.25%
        const SALAIRE_MIN_LPP = 87.10;
        const SALAIRE_SEUIL_LPP = 116.10;
        const PARTIE_ASSURABLE_MIN = 14.50;
        const SALAIRE_MAX_LPP = 348.35;

        // Calcul de la partie assurable
        let partieAssurable = 0;

        if (dailySalary < SALAIRE_MIN_LPP) {
            // Pas de cotisation LPP si salaire < 87.10
            partieAssurable = 0;
        } else if (dailySalary >= SALAIRE_MIN_LPP && dailySalary <= SALAIRE_SEUIL_LPP) {
            // Partie assurable minimum fixe
            partieAssurable = PARTIE_ASSURABLE_MIN;
        } else {
            // Salaire > 116.10: calcul normal avec coordination
            const salaireLimite = Math.min(dailySalary, SALAIRE_MAX_LPP);
            partieAssurable = salaireLimite - MONTANT_COORDINATION;
        }

        // Calcul final LPP = partie_assurable × jours × 0.0025 ÷ 2
        // Diviser par 2 car l'employé paie 50%, l'assurance-chômage paie 50%
        const lppDeduction = (partieAssurable * numberOfDays * TAUX_LPP) / 2;

        return Math.max(0, lppDeduction); // S'assurer que la déduction n'est jamais négative
    }

    getLPPCalculationDetails(dailySalary, numberOfDays) {
        // Constantes LPP
        const MONTANT_COORDINATION = 101.60;
        const TAUX_LPP = 0.0025; // 0.25%
        const SALAIRE_MIN_LPP = 87.10;
        const SALAIRE_SEUIL_LPP = 116.10;
        const PARTIE_ASSURABLE_MIN = 14.50;
        const SALAIRE_MAX_LPP = 348.35;

        // Calcul de la partie assurable
        let partieAssurable = 0;
        let explanation = "";

        if (dailySalary < SALAIRE_MIN_LPP) {
            partieAssurable = 0;
            explanation = `Salaire journalier (${this.formatCurrency(dailySalary)}) < ${this.formatCurrency(SALAIRE_MIN_LPP)} → Pas de cotisation LPP`;
        } else if (dailySalary >= SALAIRE_MIN_LPP && dailySalary <= SALAIRE_SEUIL_LPP) {
            partieAssurable = PARTIE_ASSURABLE_MIN;
            explanation = `${this.formatCurrency(SALAIRE_MIN_LPP)} ≤ ${this.formatCurrency(dailySalary)} ≤ ${this.formatCurrency(SALAIRE_SEUIL_LPP)} → Partie assurable minimum: ${this.formatCurrency(PARTIE_ASSURABLE_MIN)}`;
        } else {
            const salaireLimite = Math.min(dailySalary, SALAIRE_MAX_LPP);
            partieAssurable = salaireLimite - MONTANT_COORDINATION;
            if (dailySalary > SALAIRE_MAX_LPP) {
                explanation = `Salaire limité à ${this.formatCurrency(SALAIRE_MAX_LPP)} → Partie assurable: ${this.formatCurrency(SALAIRE_MAX_LPP)} - ${this.formatCurrency(MONTANT_COORDINATION)} = ${this.formatCurrency(partieAssurable)}`;
            } else {
                explanation = `Partie assurable: ${this.formatCurrency(dailySalary)} - ${this.formatCurrency(MONTANT_COORDINATION)} = ${this.formatCurrency(partieAssurable)}`;
            }
        }

        const lppDeduction = (partieAssurable * numberOfDays * TAUX_LPP) / 2;

        return {
            partieAssurable,
            explanation,
            lppDeduction: Math.max(0, lppDeduction),
            formula: `${this.formatCurrency(partieAssurable)} × ${numberOfDays} jours × 0.25% ÷ 2`
        };
    }

    generateFinalResults() {
        const resultsContainer = document.getElementById('final-results');
        if (!resultsContainer) return;

        // Cálculos
        const grossDailyBenefit = this.data.dailyAllowance;
        const monthlyGrossBenefit = grossDailyBenefit * this.data.controlledDays;
        
        // Deduções
        const avsDeduction = monthlyGrossBenefit * 0.053; // AVS/AI/APG 5.3%
        const laaDeduction = monthlyGrossBenefit * 0.0247; // LAA 2.47%
        
        // Calcular dias efetivos para LPP (controlled days - waiting period)
        const effectiveDaysForLPP = Math.max(0, this.data.controlledDays - this.data.waitingPeriod);
        
        // Calcul LPP correct selon la réglementation suisse
        const lppDetails = this.getLPPCalculationDetails(grossDailyBenefit, effectiveDaysForLPP);
        const lppDeduction = lppDetails.lppDeduction;
        
        // Dedução assurance perte de gain (opcional)
        const lossInsuranceDeduction = this.data.hasLossInsurance ? 
            this.data.gainAssured * (this.data.compensationRate / 100) * 0.036 : 0;

        const totalDeductions = avsDeduction + laaDeduction + lppDeduction + lossInsuranceDeduction;
        const netMonthlyBenefit = monthlyGrossBenefit - totalDeductions;
        
        // Allocations enfants: 311/21.7 × nombre de jours controlés PAR ENFANT
        // Note: on prend toujours la totalité des jours controlés du mois (pas diminués du délai d'attente)
        const childAllowances = this.data.hasChildren ? 
            this.data.numChildren * (311.00 / 21.7) * this.data.controlledDays : 0;
            
        const totalNetIncome = netMonthlyBenefit + childAllowances;

        // Générer HTML des résultats
        resultsContainer.innerHTML = `
            <div class="results-summary">
                <div class="summary-card main-result">
                    <h3>💰 Résultat Principal</h3>
                    <div class="main-amount">${this.formatCurrency(totalNetIncome)}</div>
                    <p>Revenu mensuel net total</p>
                </div>
                
                <div class="summary-grid">
                    <div class="summary-card">
                        <h4>📊 Gain Assuré</h4>
                        <div class="amount">${this.formatCurrency(this.data.gainAssured)}</div>
                    </div>
                    <div class="summary-card">
                        <h4>📈 Taux d'indemnisation</h4>
                        <div class="amount">${this.data.compensationRate}%</div>
                    </div>
                    <div class="summary-card">
                        <h4>📅 Indemnité journalière</h4>
                        <div class="amount">${this.formatCurrency(grossDailyBenefit)}</div>
                    </div>
                    <div class="summary-card">
                        <h4>⏳ Délai d'attente</h4>
                        <div class="amount">${this.data.waitingPeriod} jours</div>
                    </div>
                </div>
            </div>

            <div class="detailed-calculation">
                <h3>📋 Calcul Détaillé</h3>
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Calcul</th>
                            <th>Montant (CHF)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Gain assuré mensuel</td>
                            <td>Moyenne 12 mois</td>
                            <td class="currency">${this.formatCurrency(this.data.gainAssured)}</td>
                        </tr>
                        <tr>
                            <td>Indemnité journalière brute</td>
                            <td>${this.formatCurrency(this.data.gainAssured)} × ${this.data.compensationRate}% ÷ ${this.data.controlledDays}</td>
                            <td class="currency">${this.formatCurrency(grossDailyBenefit)}</td>
                        </tr>
                        <tr class="subtotal">
                            <td><strong>Indemnité mensuelle brute</strong></td>
                            <td>${this.formatCurrency(grossDailyBenefit)} × ${this.data.controlledDays}</td>
                            <td class="currency"><strong>${this.formatCurrency(monthlyGrossBenefit)}</strong></td>
                        </tr>
                        <tr class="deduction">
                            <td>AVS/AI/APG (5.3%)</td>
                            <td>${this.formatCurrency(monthlyGrossBenefit)} × 5.3%</td>
                            <td class="currency">-${this.formatCurrency(avsDeduction)}</td>
                        </tr>
                        <tr class="deduction">
                            <td>LAA (2.47%)</td>
                            <td>${this.formatCurrency(monthlyGrossBenefit)} × 2.47%</td>
                            <td class="currency">-${this.formatCurrency(laaDeduction)}</td>
                        </tr>
                        <tr class="deduction">
                            <td>LPP (0.25% ÷ 2)</td>
                            <td>${lppDetails.formula}</td>
                            <td class="currency">-${this.formatCurrency(lppDeduction)}</td>
                        </tr>
                        ${this.data.hasLossInsurance ? `
                        <tr class="deduction">
                            <td>Ass. perte de gain (3.6%)</td>
                            <td>${this.formatCurrency(this.data.gainAssured)} × ${this.data.compensationRate}% × 3.6%</td>
                            <td class="currency">-${this.formatCurrency(lossInsuranceDeduction)}</td>
                        </tr>
                        ` : ''}
                        <tr class="subtotal">
                            <td><strong>Indemnité nette</strong></td>
                            <td>Brut - Déductions</td>
                            <td class="currency"><strong>${this.formatCurrency(netMonthlyBenefit)}</strong></td>
                        </tr>
                        ${childAllowances > 0 ? `
                        <tr class="bonus">
                            <td>Allocations enfants</td>
                            <td>${this.data.numChildren} × (311.00 ÷ 21.7) × ${this.data.controlledDays} jours</td>
                            <td class="currency">+${this.formatCurrency(childAllowances)}</td>
                        </tr>
                        ` : ''}
                        <tr class="total">
                            <td><strong>TOTAL NET MENSUEL</strong></td>
                            <td>Indemnité + Allocations</td>
                            <td class="currency"><strong>${this.formatCurrency(totalNetIncome)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            ${effectiveDaysForLPP > 0 ? `
            <div class="lpp-calculation-details">
                <h4>🧮 Détail du calcul LPP</h4>
                <p><strong>Explication:</strong> ${lppDetails.explanation}</p>
                <p><strong>Calcul:</strong> ${lppDetails.formula} = ${this.formatCurrency(lppDeduction)}</p>
                <p><strong>Jours effectifs:</strong> ${this.data.controlledDays} jours contrôlés - ${this.data.waitingPeriod} jours d'attente = ${effectiveDaysForLPP} jours</p>
                <small><em>Note: La cotisation LPP est partagée 50/50 entre employé et employeur. L'assurance-chômage paie la part employeur.</em></small>
            </div>
            ` : (this.data.waitingPeriod >= this.data.controlledDays ? `
            <div class="lpp-calculation-details">
                <h4>ℹ️ Calcul LPP</h4>
                <p>Pas de cotisation LPP ce mois-ci car le délai d'attente (${this.data.waitingPeriod} jours) couvre tous les jours contrôlés (${this.data.controlledDays} jours).</p>
            </div>
            ` : `
            <div class="lpp-calculation-details">
                <h4>ℹ️ Calcul LPP</h4>
                <p>${lppDetails.explanation}</p>
            </div>
            `)}

            ${this.data.waitingPeriod > 0 ? `
            <div class="waiting-period-notice">
                <h4>⚠️ Important: Délai d'attente</h4>
                <p>Vous avez un délai d'attente de <strong>${this.data.waitingPeriod} jours</strong> avant de recevoir vos premières indemnités.</p>
            </div>
            ` : ''}

            ${this.data.hasLossInsurance ? `
            <div class="loss-insurance-notice">
                <h4>📝 Assurance Perte de Gain</h4>
                <p>N'oubliez pas de faire une <strong>demande écrite</strong> pour déduire votre assurance perte de gain (${this.formatCurrency(lossInsuranceDeduction)}/mois).</p>
            </div>
            ` : ''}
        `;
    }

    restartWizard() {
        this.currentStep = 1;
        this.data = {
            gainAssured: 0,
            compensationRate: 70,
            dailyAllowance: 0,
            waitingPeriod: 0,
            hasChildren: false,
            numChildren: 0,
            hasDisabilityPension: false,
            hasLossInsurance: false,
            isFirstMonth: true,
            controlledDays: 21.70,
            childAllowanceMonthly: 311.00
        };
        
        // Reset form
        document.querySelectorAll('input').forEach(input => {
            if (input.type === 'radio') {
                input.checked = input.hasAttribute('checked');
            } else {
                input.value = input.defaultValue || '';
            }
        });
        
        this.updateStepDisplay();
        this.updateStepIndicator();
        this.updateCalculationMethod();
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-CH', {
            style: 'currency',
            currency: 'CHF',
            minimumFractionDigits: 2
        }).format(amount);
    }
}

// Funções globais para navegação
let wizard;

function nextStep() {
    wizard.nextStep();
}

function prevStep() {
    wizard.prevStep();
}

function calculateFinalResults() {
    wizard.calculateFinalResults();
}

function restartWizard() {
    wizard.restartWizard();
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Esperar um pouco para garantir que tudo esteja carregado
    setTimeout(() => {
        wizard = new ChomageWizard();
    }, 100);
});
