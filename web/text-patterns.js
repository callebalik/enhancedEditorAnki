// Inline patterns are executed on either pressing the spacebar or the Enter key.
// Inline patterns must have the following:
// A start, end
// A format or a cmd

// Block patterns must have the following:
// A start
// A format or a cmd
//     If cmd is specified, an optional value property is allowed.

// Block patterns are executed on pressing the Enter key.

const format_patterns = [
  { start: "*", end: "*", format: "italic" },
  { start: "**", end: "**", format: "bold" },
  { start: "~", end: "~", format: "strikethrough" },
  { start: "`", end: "`", format: "code" },
  { start: "```", end: "```", format: "pre" },
  { start: "***", end: "***", cmd: "mark" },
  { start: "#", format: "h1" },
  { start: "##", format: "h2" },
  { start: "###", format: "h3" },
  { start: "####", format: "h4" },
  { start: "#####", format: "h5" },
  { start: "######", format: "h6" },
];

block_patterns = [
  // Block patterns must have the following:
  // A start
  // A format or a cmd
  //     If cmd is specified, an optional value property is allowed.
  { start: "* ", cmd: "InsertUnorderedList" },
  { start: "- ", cmd: "InsertUnorderedList" },
  {
    start: "1. ",
    cmd: "InsertOrderedList",
    value: { "list-style-type": "decimal" },
  },
  {
    start: "1) ",
    cmd: "InsertOrderedList",
    value: { "list-style-type": "decimal" },
  },
  {
    start: "a. ",
    cmd: "InsertOrderedList",
    value: { "list-style-type": "lower-alpha" },
  },
  {
    start: "a) ",
    cmd: "InsertOrderedList",
    value: { "list-style-type": "lower-alpha" },
  },
  {
    start: "i. ",
    cmd: "InsertOrderedList",
    value: { "list-style-type": "lower-roman" },
  },
  {
    start: "i) ",
    cmd: "InsertOrderedList",
    value: { "list-style-type": "lower-roman" },
  },
];

const general_patterns = [
  { start: "---", replacement: "<hr/>" },
  { start: "--", replacement: "—" },
  { start: "(c)", replacement: "©" },
  { start: "(r)", replacement: "®" },
  { start: "(tm)", replacement: "™" },
  { start: "...", replacement: "…" },
  { start: "<<", replacement: "«" },
  { start: ">>", replacement: "»" },
  { start: "->", replacement: "→" },
  { start: "<-", replacement: "←" },
  { start: "==>", replacement: "⇒" },
  { start: "<==", replacement: "⇐" },
  { start: "!=", replacement: "≠" },
  { start: ">=", replacement: "≥" },
  { start: "<=", replacement: "≤" },
  { start: "+-", replacement: "±" },
  { start: "/d!", replacement: "¡" },
  { start: "/d?", replacement: "¿" },
  { start: "/deg", replacement: "°" },
  { start: "/int", replacement: "∫" },
  { start: "/sum", replacement: "∑" },
  { start: "/prod", replacement: "∏" },
  { start: "/lim", replacement: "lim" },
  { start: "/in", replacement: "∈" },
  { start: "/notin", replacement: "∉" },
  { start: "/subset", replacement: "⊂" },
  { start: "/subseteq", replacement: "⊆" },
  { start: "/supset", replacement: "⊃" },
  { start: "/supseteq", replacement: "⊇" },
  { start: "/cup", replacement: "∪" },
  { start: "/cap", replacement: "∩" },
  { start: "/emptyset", replacement: "∅" },
  { start: "/nabla", replacement: "∇" },
  { start: "/partial", replacement: "∂" },
  { start: "/forall", replacement: "∀" },
  { start: "/exists", replacement: "∃" },
  { start: "/neg", replacement: "¬" },
  { start: "/wedge", replacement: "∧" },
  { start: "/vee", replacement: "∨" },
  { start: "/rightarrow", replacement: "→" },
  { start: "/leftarrow", replacement: "←" },
  { start: "/Rightarrow", replacement: "⇒" },
  { start: "/Leftarrow", replacement: "⇐" },
  { start: "/leftrightarrow", replacement: "↔" },
  { start: "/Leftrightarrow", replacement: "⇔" },
  { start: "/vdash", replacement: "⊢" },
  { start: "/models", replacement: "⊨" },
  { start: "/perp", replacement: "⊥" },
  { start: "/angle", replacement: "∠" },
  { start: "/triangle", replacement: "△" },
  { start: "/square", replacement: "□" },
  { start: "/diamond", replacement: "◇" },
  // Medical
  { start: "/ddx", replacement: "Differentialdiagnoser" },
  { start: "/d!", replacement: "¡" },
  { start: "/d?", replacement: "¿" },
  { start: "/deg", replacement: "°" },

  { start: "/int", replacement: "∫" },
  { start: "/sum", replacement: "∑" },
  { start: "/prod", replacement: "∏" },
  { start: "/lim", replacement: "lim" },
  { start: "/in", replacement: "∈" },
  { start: "/notin", replacement: "∉" },
  { start: "/subset", replacement: "⊂" },
  { start: "/subseteq", replacement: "⊆" },
  { start: "/supset", replacement: "⊃" },
  { start: "/supseteq", replacement: "⊇" },
  { start: "/cup", replacement: "∪" },
  { start: "/cap", replacement: "∩" },
  { start: "/emptyset", replacement: "∅" },
  { start: "/nabla", replacement: "∇" },
  { start: "/partial", replacement: "∂" },
  { start: "/forall", replacement: "∀" },
  { start: "/exists", replacement: "∃" },
  { start: "/neg", replacement: "¬" },
  { start: "/wedge", replacement: "∧" },
  { start: "/vee", replacement: "∨" },
  { start: "/rightarrow", replacement: "→" },
  { start: "/leftarrow", replacement: "←" },
  { start: "/Rightarrow", replacement: "⇒" },
  { start: "/Leftarrow", replacement: "⇐" },
  { start: "/leftrightarrow", replacement: "↔" },
  { start: "/Leftrightarrow", replacement: "⇔" },
  { start: "/vdash", replacement: "⊢" },
  { start: "/models", replacement: "⊨" },
  { start: "/perp", replacement: "⊥" },
  { start: "/angle", replacement: "∠" },
  { start: "/triangle", replacement: "△" },
  { start: "/square", replacement: "□" },
  { start: "/diamond", replacement: "◇" },
  // Medical
  { start: "/ddx", replacement: "Differential Diagnosis" },
  { start: "/ttx", replacement: "Treatments" },
];

const greek_alphabet = [
  { start: "/alpha", replacement: "α" },
  { start: "/Alpha", replacement: "Α" },
  { start: "/beta", replacement: "β" },
  { start: "/Beta", replacement: "Β" },
  { start: "/gamma", replacement: "γ" },
  { start: "/Gamma", replacement: "Γ" },
  { start: "/delta", replacement: "δ" },
  { start: "/Delta", replacement: "Δ" },
  { start: "/epsilon", replacement: "ε" },
  { start: "/Epsilon", replacement: "Ε" },
  { start: "/zeta", replacement: "ζ" },
  { start: "/Zeta", replacement: "Ζ" },
  { start: "/eta", replacement: "η" },
  { start: "/Eta", replacement: "Η" },
  { start: "/theta", replacement: "θ" },
  { start: "/Theta", replacement: "Θ" },
  { start: "/iota", replacement: "ι" },
  { start: "/Iota", replacement: "Ι" },
  { start: "/kappa", replacement: "κ" },
  { start: "/Kappa", replacement: "Κ" },
  { start: "/lambda", replacement: "λ" },
  { start: "/Lambda", replacement: "Λ" },
  { start: "/mu", replacement: "μ" },
  { start: "/Mu", replacement: "Μ" },
  { start: "/nu", replacement: "ν" },
  { start: "/Nu", replacement: "Ν" },
  { start: "/xi", replacement: "ξ" },
  { start: "/Xi", replacement: "Ξ" },
  { start: "/omicron", replacement: "ο" },
  { start: "/Omicron", replacement: "Ο" },
  { start: "/pi", replacement: "π" },
  { start: "/Pi", replacement: "Π" },
  { start: "/rho", replacement: "ρ" },
  { start: "/Rho", replacement: "Ρ" },
  { start: "/sigma", replacement: "σ" },
  { start: "/Sigma", replacement: "Σ" },
  { start: "/tau", replacement: "τ" },
  { start: "/Tau", replacement: "Τ" },
  { start: "/upsilon", replacement: "υ" },
  { start: "/Upsilon", replacement: "Υ" },
  { start: "/phi", replacement: "φ" },
  { start: "/Phi", replacement: "Φ" },
  { start: "/chi", replacement: "χ" },
  { start: "/Chi", replacement: "Χ" },
  { start: "/psi", replacement: "ψ" },
  { start: "/Psi", replacement: "Ψ" },
  { start: "/omega", replacement: "ω" },
  { start: "/Omega", replacement: "Ω" },
  { start: "/ohm", replacement: "Ω" },
];

math_patterns = [{ start: "/infty", replacement: "∞" }];

const text_patterns = general_patterns
  .concat(greek_alphabet)
  .concat(math_patterns)
  .concat(format_patterns)
  .concat(block_patterns);
