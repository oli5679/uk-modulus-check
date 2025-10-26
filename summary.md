Purpose & Scope
	•	The document explains how UK bank/BS account numbers (in conjunction with sorting codes) can be validated using modulus-checking algorithms.  ￼
	•	It is aimed at payment originators (for example via the Bacs Payment Schemes Limited clearing service) and any system implementing checks to reduce returned transactions.  ￼
	•	It covers two main types of check (“standard” modulus check and “double alternate”) and defines how these apply, along with exceptions, for different sorting-code ranges.  ￼
	•	It also includes a specification (weight tables, sorting-code ranges, exception rules) and test-cases.  ￼

⸻

Key Concepts
	•	Modulus Checking: A numerical algorithm where digits of the sorting code plus account number are multiplied by weights, summed, then divided by a modulus (10 or 11) and remainder checked. If remainder = 0 (or some specified condition) the account is potentially valid.  ￼
	•	Methods:
	•	Standard modulus check (Mod10 or Mod11) – uses a straightforward weighting, then divide by modulus.  ￼
	•	Double alternate (DblAl) – starts from the penultimate right-hand digit, alternately doubles digits, etc. Slightly different process.  ￼
	•	Weight tables & notation: The document uses notation for the sorting code digits (u, v, w, x, y, z) and account number digits (a, b, c … h) so you can refer to positions in the process.  ￼
	•	Validation process (flow-diagram):
	1.	Check if the sorting code is present in the relevant directory (EISCD/ISCD).
	2.	If yes, identify which check(s) (method & weights) apply.
	3.	If needed: apply a substitution of sorting code (if listed).
	4.	Perform the modulus check(s).
	5.	If passes → account number is possible valid. If fails → invalid. Note: possible valid does not guarantee that account exists.  ￼

⸻

Specification Details
	•	Applicability: Only sorting-codes that appear in the industry directory and have modulus rules defined in the weight-table can be checked. If sorting-code is not in the table, you cannot apply the check and must assume validity (or use other measures).  ￼
	•	Non-standard account numbers: Some financial institutions use account numbers of 9 or 10 digits (not the standard 8 digits). The document gives guidance on how to convert these into an 8-digit format for checking purposes (for example: for 10-digit account numbers use last 8 digits, or first 8 as appropriate) prior to running the modulus check.  ￼
	•	Exception rules: There are many “Exceptions” (numbered 1,2,3,4,5…14) that define special-case modifications to the standard checking procedure for certain sorting codes or institutions. For example:
	•	Exception 5: substitute sorting code for checking, special check-digit logic.  ￼
	•	Exception 14: special two-stage check for one institution (remove or modify digit) if first check fails.  ￼
	•	Weight Table: The document contains a large table (from page 25 onwards) listing many sorting-code ranges, the modulus method (Mod10/Mod11/DblAl), the weights for each digit position (u to h) and any exception number.  ￼

⸻

Practical Summary & Usage Tips
	•	If you’re implementing an account‐number validation system:
	1.	Maintain an up-to-date version of this specification (and associated weight tables) because sorting-code ranges and rules change over time.  ￼
	2.	When an incoming sorting-code/account-number pair arrives: check if sorting code appears in the directory and the weight table.
	3.	Convert account number to 8 digits if required (pre-process nonstandard lengths).
	4.	Determine which algorithm to apply (Mod10, Mod11 or DblAl) and apply the weights as specified.
	5.	Apply any exception rule if the sorting code is flagged with one.
	6.	If check passes: you consider the pair possibly valid. If it fails: mark it as invalid and ideally verify with the account‐holder/institution.
	•	It’s important to understand that passing the modulus check does not guarantee the account actually exists or is in use: it only means the digits conform to the algorithm for that sorting code. The document emphasises this.  ￼
	•	Because of exceptions and nonstandard lengths, building societies, foreign-currency accounts, euro accounts etc might need special handling.
	•	Keep track of version changes: the document has a version history (v8.50 as of June 2025) and changes often include new sorting-code ranges or weight alterations.  ￼

⸻

If you like, I can pull out key tables (e.g., typical weightings, major exception types) and deliver them as a cheat-sheet for implementing in software. Would you like me to do that?