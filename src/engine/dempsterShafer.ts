export interface MassFunction {
  sourceName: string;
  assignments: {
    set: string[]; // e.g. ['RED'], ['RED', 'ORANGE'], ['THETA'] (where THETA is all)
    mass: number;
    description: string;
  }[];
}

export class DempsterShaferEngine {
  public static readonly THETA = ['RED', 'ORANGE', 'YELLOW', 'GREEN'];

  /**
   * Check set equality
   */
  private static setsEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  }

  /**
   * Intersection of two string sets
   */
  private static intersect(a: string[], b: string[]): string[] {
    return a.filter(x => b.includes(x));
  }

  /**
   * Combine two independent mass functions using Dempster's Rule of Combination
   */
  public static combine(m1: MassFunction, m2: MassFunction): {
    combinedAssignments: { set: string[]; mass: number }[];
    conflict: number;
  } {
    const rawCombinations: { set: string[]; mass: number }[] = [];
    let conflict = 0;

    for (const a of m1.assignments) {
      for (const b of m2.assignments) {
        const intersection = this.intersect(a.set, b.set);
        const product = a.mass * b.mass;

        if (intersection.length === 0) {
          conflict += product;
        } else {
          // Check if already in raw
          const existing = rawCombinations.find(r => this.setsEqual(r.set, intersection));
          if (existing) {
            existing.mass += product;
          } else {
            rawCombinations.push({ set: intersection, mass: product });
          }
        }
      }
    }

    const normalization = 1 - conflict;
    if (normalization <= 0.0001) {
      // Complete conflict
      return { combinedAssignments: rawCombinations, conflict: 1 };
    }

    const combinedAssignments = rawCombinations.map(entry => ({
      set: entry.set,
      mass: Number((entry.mass / normalization).toFixed(4))
    }));

    return { combinedAssignments, conflict: Number(conflict.toFixed(4)) };
  }

  /**
   * Calculate Belief and Plausibility for a focal hypothesis
   */
  public static calculateBeliefPlausibility(
    focalSet: string[],
    assignments: { set: string[]; mass: number }[]
  ): {
    belief: number;
    plausibility: number;
    uncertainty: number;
  } {
    let belief = 0;
    let plausibility = 0;

    for (const { set, mass } of assignments) {
      // Belief: sum of masses of subsets entirely contained within focalSet
      const isSubset = set.every(elem => focalSet.includes(elem));
      if (isSubset) {
        belief += mass;
      }

      // Plausibility: sum of masses of sets having non-empty intersection with focalSet
      const hasIntersection = set.some(elem => focalSet.includes(elem));
      if (hasIntersection) {
        plausibility += mass;
      }
    }

    belief = Math.min(1, Number(belief.toFixed(4)));
    plausibility = Math.min(1, Number(plausibility.toFixed(4)));
    const uncertainty = Number((plausibility - belief).toFixed(4));

    return { belief, plausibility, uncertainty };
  }
}
