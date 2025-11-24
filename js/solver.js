"use strict";

/**
 * Solve the triangle sum puzzle:
 * choose 6 distinct numbers from {1..10} placed at
 * (v1, v2, v3, e12, e23, e31) so that:
 *   v1 + e12 + v2 = N
 *   v2 + e23 + v3 = N
 *   v3 + e31 + v1 = N
 *
 * Optionally, you can exclude one number from {1..10}
 * (e.g. excludeNumber = 6 will find only solutions that
 * do not use 6 anywhere).
 *
 * @param {number} targetSum - Desired side sum N.
 * @param {number|null} [excludeNumber=null] - Number to exclude from all positions.
 * @returns {Array<{v1:number,v2:number,v3:number,e12:number,e23:number,e31:number}>}
 */
export function solveTriangle(targetSum, excludedNumbers = []) {
  const N = Number(targetSum);
  if (!Number.isFinite(N)) {
    throw new TypeError("targetSum must be a finite number");
  }

  // Normalise excluded numbers to a Set of ints in [1, 10]
  const excludedSet = new Set(
    (excludedNumbers || [])
      .map((x) => Number(x))
      .filter(
        (x) => Number.isInteger(x) && x >= 1 && x <= 10
      )
  );

  const nums = Array.from({ length: 10 }, (_, i) => i + 1); // 1..10
  const used = new Array(nums.length).fill(false);
  const pick = new Array(6);
  const solutions = [];

  function backtrack(depth) {
    if (depth === 6) {
      const [v1, v2, v3, e12, e23, e31] = pick;
      if (
        v1 + e12 + v2 === N &&
        v2 + e23 + v3 === N &&
        v3 + e31 + v1 === N
      ) {
        solutions.push({ v1, v2, v3, e12, e23, e31 });
      }
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      if (excludedSet.has(nums[i])) continue;

      used[i] = true;
      pick[depth] = nums[i];
      backtrack(depth + 1);
      used[i] = false;
    }
  }

  backtrack(0);
  return solutions;
}

