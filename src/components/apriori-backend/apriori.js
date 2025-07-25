/**
 * Fungsi utama untuk menjalankan seluruh proses Apriori.
 * @param {Array<Array<string>>} transactions - Array transaksi, contoh: [['Roti', 'Susu'], ['Roti', 'Mentega']]
 * @param {number} minSupport - Nilai minimum support (misal: 0.1 untuk 10%)
 * @param {number} minConfidence - Nilai minimum confidence (misal: 0.5 untuk 50%)
 * @returns {object} - Hasil analisa berisi frequent itemsets dan aturan asosiasi
 */
function runApriori(transactions, minSupport, minConfidence) {
    const totalTransactions = transactions.length;
    const L1 = calculateInitialSupport(transactions, minSupport, totalTransactions);
    let frequentItemsets = { ...L1.frequent };
    let currentL = L1.frequentArray;
    let k = 2;
    let allSteps = { C1: L1.candidates, L1: L1.frequent };

    while (currentL.length > 0) {
        const Ck = generateCandidates(currentL, k);
        if(Ck.length === 0) break;
        const Lk = calculateSupport(transactions, Ck, minSupport, totalTransactions);
        
        if (Object.keys(Lk.frequent).length > 0) {
            allSteps[`C${k}`] = Lk.candidates;
            allSteps[`L${k}`] = Lk.frequent;
            frequentItemsets = { ...frequentItemsets, ...Lk.frequent };
            currentL = Lk.frequentArray;
        } else {
            currentL = [];
        }
        k++;
    }
    
    const associationRules = generateAssociationRules(frequentItemsets, minConfidence);
    return { steps: allSteps, frequentItemsets, associationRules };
}

function calculateInitialSupport(transactions, minSupport, totalTransactions) {
    let candidates = {};
    transactions.forEach(transaction => {
        transaction.forEach(item => {
            candidates[item] = (candidates[item] || 0) + 1;
        });
    });
    
    let frequent = {};
    let frequentArray = [];
    for (const item in candidates) {
        const support = candidates[item] / totalTransactions;
        if (support >= minSupport) {
            frequent[item] = support;
            frequentArray.push([item]);
        }
    }
    return { candidates, frequent, frequentArray };
}

function generateCandidates(prevL, k) {
    const candidates = [];
    for (let i = 0; i < prevL.length; i++) {
        for (let j = i + 1; j < prevL.length; j++) {
            const itemset1 = prevL[i];
            const itemset2 = prevL[j];
            const newItemset = [...new Set([...itemset1, ...itemset2])].sort();
            
            if (newItemset.length === k) {
                const key = newItemset.join(',');
                if (!candidates.some(c => c.join(',') === key)) {
                     if (hasInfrequentSubset(newItemset, prevL)) {
                         continue;
                     }
                    candidates.push(newItemset);
                }
            }
        }
    }
    return candidates;
}

function hasInfrequentSubset(itemset, prevL) {
    for (let i = 0; i < itemset.length; i++) {
        const subset = [...itemset.slice(0, i), ...itemset.slice(i + 1)];
        const subsetKey = subset.join(',');
        
        if (!prevL.some(l => {
            if (l && Array.isArray(l)) {
                return l.join(',') === subsetKey;
            }
            return false;
        })) {
            return true;
        }
    }
    return false;
}

function calculateSupport(transactions, candidates, minSupport, totalTransactions) {
    let candidatesCount = {};
    candidates.forEach(c => {
        const key = c.join(',');
        candidatesCount[key] = 0;
    });
    transactions.forEach(transaction => {
        candidates.forEach(candidate => {
            if (candidate.every(item => transaction.includes(item))) {
                const key = candidate.join(',');
                candidatesCount[key]++;
            }
        });
    });
    
    let frequent = {};
    let frequentArray = [];
    for (const key in candidatesCount) {
        const support = candidatesCount[key] / totalTransactions;
        if (support >= minSupport) {
            frequent[key] = support;
            frequentArray.push(key.split(','));
        }
    }
    return { candidates: candidatesCount, frequent, frequentArray };
}

function generateAssociationRules(frequentItemsets, minConfidence) {
    const rules = [];
    for (const key in frequentItemsets) {
        const itemset = key.split(',');
        if (itemset.length > 1) {
            const allSubsets = getSubsets(itemset);
            allSubsets.forEach(subset => {
                if (subset.length > 0 && subset.length < itemset.length) {
                    const antecedent = subset;
                    const consequent = itemset.filter(item => !subset.includes(item));
                    const antecedentKey = antecedent.sort().join(',');
                    const itemsetKey = [...antecedent, ...consequent].sort().join(',');
                    if (frequentItemsets[antecedentKey]) {
                        const confidence = frequentItemsets[itemsetKey] / frequentItemsets[antecedentKey];
                        if (confidence >= minConfidence) {
                            rules.push({
                                antecedent: antecedent.join(', '),
                                consequent: consequent.join(', '),
                                confidence,
                                support: frequentItemsets[itemsetKey]
                            });
                        }
                    }
                }
            });
        }
    }
    return rules;
}

function getSubsets(arr) {
    return arr.reduce((subsets, value) => subsets.concat(subsets.map(set => [value, ...set])),[[]]);
}

module.exports = { runApriori };
