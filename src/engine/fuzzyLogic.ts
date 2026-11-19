import { FuzzyVariable, FuzzySet } from '../types/uncertainty';

export class FuzzyLogicEngine {
  /**
   * Calculate degree of membership for triangular function
   * [a, b, c] where a is left base, b is peak, c is right base
   */
  public static evalTriangular(x: number, a: number, b: number, c: number): number {
    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    if (x > b && x < c) return (c - x) / (c - b);
    return 0;
  }

  /**
   * Calculate degree of membership for trapezoidal function
   * [a, b, c, d] where a-b is rising slope, b-c is plateau (1.0), c-d is falling slope
   */
  public static evalTrapezoidal(x: number, a: number, b: number, c: number, d: number): number {
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    if (x > c && x < d) return (d - x) / (d - c);
    return 0;
  }

  public static getMembership(x: number, set: FuzzySet): number {
    if (set.type === 'triangular') {
      const [a, b, c] = set.points as [number, number, number];
      return this.evalTriangular(x, a, b, c);
    } else {
      const [a, b, c, d] = set.points as [number, number, number, number];
      return this.evalTrapezoidal(x, a, b, c, d);
    }
  }

  /**
   * Predefined standard fuzzy variables for emergency vitals
   */
  public static getStandardFuzzyVariables(currentVitals?: { spo2: number; heartRate: number; temperature: number }): FuzzyVariable[] {
    const spo2Val = currentVitals?.spo2 ?? 94;
    const hrVal = currentVitals?.heartRate ?? 110;
    const tempVal = currentVitals?.temperature ?? 38.4;

    return [
      {
        name: 'Oxygen Saturation (SpO2)',
        unit: '%',
        min: 80,
        max: 100,
        currentValue: spo2Val,
        sets: [
          {
            name: 'Critical Hypoxia',
            color: '#dc2626',
            type: 'trapezoidal',
            points: [75, 80, 88, 91]
          },
          {
            name: 'Borderline Hypoxia',
            color: '#ea580c',
            type: 'triangular',
            points: [88, 92, 95]
          },
          {
            name: 'Normal Oxygenation',
            color: '#16a34a',
            type: 'trapezoidal',
            points: [93, 96, 100, 100]
          }
        ]
      },
      {
        name: 'Heart Rate (Pulse)',
        unit: 'bpm',
        min: 40,
        max: 160,
        currentValue: hrVal,
        sets: [
          {
            name: 'Bradycardia',
            color: '#3b82f6',
            type: 'trapezoidal',
            points: [40, 40, 50, 60]
          },
          {
            name: 'Normal Resting',
            color: '#16a34a',
            type: 'trapezoidal',
            points: [55, 65, 95, 105]
          },
          {
            name: 'Mild Tachycardia',
            color: '#f59e0b',
            type: 'triangular',
            points: [95, 115, 130]
          },
          {
            name: 'Severe Tachycardia',
            color: '#dc2626',
            type: 'trapezoidal',
            points: [120, 135, 160, 160]
          }
        ]
      },
      {
        name: 'Body Temperature',
        unit: '°C',
        min: 35.0,
        max: 41.0,
        currentValue: tempVal,
        sets: [
          {
            name: 'Hypothermia',
            color: '#0284c7',
            type: 'trapezoidal',
            points: [34.0, 34.0, 35.5, 36.2]
          },
          {
            name: 'Normothermia',
            color: '#16a34a',
            type: 'trapezoidal',
            points: [36.0, 36.5, 37.3, 37.6]
          },
          {
            name: 'Low-Grade Pyrexia',
            color: '#f59e0b',
            type: 'triangular',
            points: [37.3, 38.0, 38.6]
          },
          {
            name: 'High Pyrexia',
            color: '#dc2626',
            type: 'trapezoidal',
            points: [38.3, 39.0, 41.0, 41.0]
          }
        ]
      }
    ];
  }

  /**
   * Evaluate fuzzy linguistic output for patient vitals
   */
  public static evaluateFuzzyUrgency(spo2: number, heartRate: number, temperature: number): {
    urgencyIndex: number; // 0 to 100
    linguisticResult: 'Mild' | 'Moderate' | 'High' | 'Critical';
    activeRules: string[];
  } {
    const vars = this.getStandardFuzzyVariables({ spo2, heartRate, temperature });
    
    // Evaluate memberships
    const spo2Crit = this.getMembership(spo2, vars[0].sets[0]);
    const spo2Border = this.getMembership(spo2, vars[0].sets[1]);
    const spo2Norm = this.getMembership(spo2, vars[0].sets[2]);

    const hrSev = this.getMembership(heartRate, vars[1].sets[3]);
    const hrMild = this.getMembership(heartRate, vars[1].sets[2]);
    const hrNorm = this.getMembership(heartRate, vars[1].sets[1]);

    const tempHigh = this.getMembership(temperature, vars[2].sets[3]);
    const tempLowGrade = this.getMembership(temperature, vars[2].sets[2]);

    const rulesFired: string[] = [];

    // Fuzzy Rule 1: IF SpO2 is Critical THEN Urgency is Critical (weight 95)
    let criticalScore = spo2Crit * 95;
    if (spo2Crit > 0.2) rulesFired.push(`IF SpO2 is Critical (μ=${spo2Crit.toFixed(2)}) THEN Critical Urgency`);

    // Fuzzy Rule 2: IF HR is Severe Tachycardia THEN Urgency is High-Critical (weight 90)
    if (hrSev > 0.2) {
      criticalScore = Math.max(criticalScore, hrSev * 90);
      rulesFired.push(`IF HeartRate is Severe Tachycardia (μ=${hrSev.toFixed(2)}) THEN High Urgency`);
    }

    // Fuzzy Rule 3: IF SpO2 is Borderline AND Temp is High THEN Urgency is High (weight 78)
    const rule3 = Math.min(spo2Border, tempHigh);
    let highUrgencyScore = rule3 * 80;
    if (rule3 > 0.15) rulesFired.push(`IF SpO2 Borderline AND High Fever (μ=${rule3.toFixed(2)}) THEN Urgent`);

    // Fuzzy Rule 4: IF HR is Mild Tachycardia AND Temp is Low-Grade THEN Urgency is Moderate (weight 55)
    const rule4 = Math.min(hrMild, tempLowGrade);
    let modScore = Math.max(hrMild * 50, rule4 * 60);
    if (rule4 > 0.15) rulesFired.push(`IF Mild Tachycardia AND Low-Grade Fever (μ=${rule4.toFixed(2)}) THEN Moderate`);

    // Fuzzy Rule 5: IF Normal SpO2 AND Normal HR THEN Urgency is Mild (weight 15)
    const normScore = Math.min(spo2Norm, hrNorm) * 20;

    // Defuzzification (Centroid-like weighted combination)
    const totalWeight = Math.max(0.01, spo2Crit + hrSev + rule3 + rule4 + Math.min(spo2Norm, hrNorm));
    const combinedIndex = Math.min(100, Math.max(10, 
      (criticalScore * 1.0 + highUrgencyScore * 0.8 + modScore * 0.6 + normScore * 0.2) / totalWeight
    ));

    let linguistic: 'Mild' | 'Moderate' | 'High' | 'Critical' = 'Mild';
    if (combinedIndex >= 80) linguistic = 'Critical';
    else if (combinedIndex >= 60) linguistic = 'High';
    else if (combinedIndex >= 40) linguistic = 'Moderate';

    return {
      urgencyIndex: Math.round(combinedIndex),
      linguisticResult: linguistic,
      activeRules: rulesFired.length ? rulesFired : ['Normal physiological membership across all fuzzy sets']
    };
  }
}
