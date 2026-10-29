const express = require('express');
const router = express.Router();
const {
  predictStacking,
  predictDecisionTree,
  predictRandomForest,
  predictKNN,
  predictSVM,
  calculateCrossEntropyLoss,
  MODEL_BENCHMARKS,
  CONFUSION_MATRIX
} = require('../ml/stackingClassifier');

/**
 * Get research paper comparative evaluation metrics (Table 3 & Fig 2)
 */
router.get('/benchmarks', (req, res) => {
  res.json({
    table3: MODEL_BENCHMARKS,
    confusionMatrix: CONFUSION_MATRIX,
    metaLearnerInfo: {
      type: 'Stacking Ensemble Meta-Classifier',
      baseLearners: ['Decision Tree', 'Random Forest', 'K-Nearest Neighbors (KNN)', 'Support Vector Machine (SVM)'],
      metaLearner: 'Logistic Regression Meta-Classifier',
      lossFunction: 'Cross-Entropy Loss: L = - (1/N) * sum(y_i * log(y_hat_i) + (1 - y_i) * log(1 - y_hat_i))',
      bestAccuracy: '99.1%',
      bestPrecision: '98.9%',
      bestRecall: '98.8%',
      bestF1Score: '98.8%'
    }
  });
});

/**
 * Run test prediction for custom temperature & gas values
 */
router.post('/predict', (req, res) => {
  const { temperature, gasPpm } = req.body;
  if (temperature === undefined || gasPpm === undefined) {
    return res.status(400).json({ error: 'temperature and gasPpm are required' });
  }

  const t = parseFloat(temperature);
  const g = parseFloat(gasPpm);

  const dt = predictDecisionTree(t, g);
  const rf = predictRandomForest(t, g);
  const knn = predictKNN(t, g);
  const svm = predictSVM(t, g);
  const stacking = predictStacking(t, g);

  // Compute cross entropy loss for this sample assuming ground truth
  const actual = (t >= 34.0 || g >= 300) ? 1 : 0;
  const sampleLoss = calculateCrossEntropyLoss([stacking.anomalyScore], [actual]);

  res.json({
    input: { temperature: t, gasPpm: g },
    groundTruthAssessment: actual === 1 ? 'HAZARDOUS_CONDITION' : 'SAFE_CONDITION',
    sampleLoss,
    comparison: [
      { model: 'Decision Tree', prediction: dt.label, probability: dt.prob, paperAccuracy: '94.8%' },
      { model: 'Random Forest', prediction: rf.label, probability: rf.prob, paperAccuracy: '96.7%' },
      { model: 'KNN', prediction: knn.label, probability: knn.prob, paperAccuracy: '95.5%' },
      { model: 'SVM', prediction: svm.label, probability: svm.prob, paperAccuracy: '97.2%' },
      { model: 'Stacking Classifier (Ensemble)', prediction: stacking.status, probability: stacking.anomalyScore, paperAccuracy: '99.1%', isEnsemble: true }
    ],
    finalDecision: stacking.status,
    anomalyScore: stacking.anomalyScore,
    confidence: stacking.confidence
  });
});

module.exports = router;
