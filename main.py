from itertools import permutations
from time import perf_counter

def check_triangle(A, B, C, D, E, F, target_sum):
    """
    Map matches the JS solver:
      A = v1 (top)
      B = v2 (bottom-left)
      C = v3 (bottom-right)
      D = e12 (between v1–v2)
      E = e23 (between v2–v3)
      F = e31 (between v3–v1)
    Side sums:
      left   = A + D + B
      bottom = B + E + C
      right  = C + F + A
    """
    left_sum   = A + D + B
    bottom_sum = B + E + C
    right_sum  = C + F + A

    all_ok = (
        left_sum == target_sum and
        bottom_sum == target_sum and
        right_sum == target_sum
    )

    return all_ok, {
        "left": left_sum,
        "bottom": bottom_sum,
        "right": right_sum,
    }

def solve_triangle(target_sum):
    """
    Search all permutations of length 6 from numbers 1..10
    and return every arrangement where all three sides equal target_sum.
    """
    numbers = range(1, 11)  # 1..10
    solutions = []

    for A, B, C, D, E, F in permutations(numbers, 6):
        ok, sums = check_triangle(A, B, C, D, E, F, target_sum)
        if ok:
            solutions.append({
                "positions": {"A": A, "B": B, "C": C, "D": D, "E": E, "F": F},
                "sums": sums,
            })

    return solutions

def draw_triangle(positions):
    """ASCII-art view of the triangle with numbers in place."""
    A = positions["A"]
    B = positions["B"]
    C = positions["C"]
    D = positions["D"]
    E = positions["E"]
    F = positions["F"]

    print()
    print(f"             ({A})      v1 / A")
    print("            /   \\")
    print(f"         ({D})   ({F})   e12 / D, e31 / F")
    print("          /         \\")
    print(f"       ({B})---({E})---({C})   v2 / B, e23 / E, v3 / C")
    print()

# ---------- MAIN PROGRAM ----------

def main():
    try:
        target = int(input("Enter target edge sum N: "))
    except ValueError:
        print("Please enter a valid integer for N.")
        return

    print(f"\nSearching all permutations of length 6 from numbers 1..10 for N = {target}…")
    t0 = perf_counter()
    solutions = solve_triangle(target)
    elapsed_ms = (perf_counter() - t0) * 1000

    count = len(solutions)
    print(f"\nFound {count} solution(s) for N = {target} in {elapsed_ms:.1f} ms.\n")

    if count == 0:
        print("No valid triangle arrangements for this N.")
        return

    # Print all solutions (you can limit if it’s too many)
    for idx, sol in enumerate(solutions, start=1):
        pos = sol["positions"]
        sums = sol["sums"]

        print(f"Solution {idx}:")
        print(f"  (A, B, C, D, E, F) = "
              f"({pos['A']}, {pos['B']}, {pos['C']}, {pos['D']}, {pos['E']}, {pos['F']})")
        print(f"  Side sums: left={sums['left']}, bottom={sums['bottom']}, right={sums['right']}")
        draw_triangle(pos)
        print("-" * 60)

if __name__ == "__main__":
    main()
