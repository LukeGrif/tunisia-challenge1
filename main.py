from itertools import permutations

def score_arrangement(A, B, C, D, E, F, target_sum):
    # Sums for each side
    left_sum   = A + D + B      # left side
    bottom_sum = B + E + C      # bottom (horizontal)
    right_sum  = C + F + A      # right side

    left_ok   = (left_sum == target_sum)
    bottom_ok = (bottom_sum == target_sum)
    right_ok  = (right_sum == target_sum)

    score = 0
    if bottom_ok:
        score += 20
    if left_ok:
        score += 40
    if right_ok:
        score += 40

    return score, {
        "left": left_sum,
        "bottom": bottom_sum,
        "right": right_sum
    }, {
        "left": left_ok,
        "bottom": bottom_ok,
        "right": right_ok
    }

def find_best_arrangements(nums, target_sum):
    best_score = -1
    best_arrangements = []

    for perm in permutations(nums):
        A, B, C, D, E, F = perm
        score, sums, ok = score_arrangement(A, B, C, D, E, F, target_sum)

        if score > best_score:
            best_score = score
            best_arrangements = [{
                "positions": {"A": A, "B": B, "C": C, "D": D, "E": E, "F": F},
                "score": score,
                "sums": sums,
                "ok": ok
            }]
        elif score == best_score:
            best_arrangements.append({
                "positions": {"A": A, "B": B, "C": C, "D": D, "E": E, "F": F},
                "score": score,
                "sums": sums,
                "ok": ok
            })

    return best_score, best_arrangements

def draw_triangle(positions):
    """ASCII-art view of the triangle with numbers in place."""
    A = positions["A"]
    B = positions["B"]
    C = positions["C"]
    D = positions["D"]
    E = positions["E"]
    F = positions["F"]

    print("Visual layout (as you should place the pieces):")
    print()
    print(f"             ({A})")
    print("            /   \\")
    print(f"         ({D})   ({F})")
    print("          /         \\")
    print(f"       ({B})---({E})---({C})")
    print()

def print_instructions(arrangement, target_sum):
    pos = arrangement["positions"]
    sums = arrangement["sums"]
    ok = arrangement["ok"]
    score = arrangement["score"]

    print(f"Total score for this arrangement: {score} points\n")


    # Visual triangle
    draw_triangle(pos)

    if score == 100:
        print(f"\n✅ Perfect triangle! All three sides equal the target {target_sum}.")
    elif score > 0:
        print(f"\nℹ This arrangement does NOT get all three sides correct,")
        print("  but it maximizes the score according to the rules.")
    else:
        print("\n⚠ No side reaches the target sum in this arrangement.")

# ---------- MAIN PROGRAM ----------

nums = [int(x) for x in input("Enter 6 piece numbers separated by spaces: ").split()]

if len(nums) != 6:
    print("Please enter exactly 6 numbers.")
else:
    target = int(input("Enter target edge sum N: "))

    best_score, best_arrangements = find_best_arrangements(nums, target)

    if best_score <= 0:
        print(f"\nNo arrangement gives any correct side for target {target}.")
    else:
        print(f"\nBest possible score with these pieces and target {target}: {best_score} points\n")
        # Show the first best arrangement with visual triangle
        print_instructions(best_arrangements[0], target)
        # If there are multiple best arrangements, you could also show others if you want.
