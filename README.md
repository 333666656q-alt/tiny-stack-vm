# Tiny stack VM

A byte-exact interpreter for make.fun's tiny stack ISA (the competition kit's
`generator/subject/ISA.md`), for the make.fun bounty "Build a tiny stack virtual
machine, 22 November 2026".

For each `/input/<id>/program.bin` (with its `input.bin`), `main.ts` writes
`/output/<id>/stdout.bin` and `/output/<id>/exit.txt`, matching the reference VM on
every opcode and edge case: wrapping 32-bit arithmetic, signed/unsigned division and
remainder, masked shift counts, all ten trap codes in the reference's check order, and
the step and output limits. Deterministic: answers depend only on the input bytes.
