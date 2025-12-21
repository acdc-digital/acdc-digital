Math
Inline and block LaTeX formulas rendered with KaTeX.
Prose UI supports inline and block math formulas in LaTeX syntax, rendered with KaTeX.

KaTeX CSS required
Make sure you've imported the KaTeX stylesheet in your globals.css file:

@import "@prose-ui/style/katex.min.css";

See the installation guide for more details.

Inline math
Use single dollar signs $...$ for inline math formulas within paragraphs.

Inline math example

The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ for solving equations.
The quadratic formula is 
x
=
−
b
±
b
2
−
4
a
c
2
a
x= 
2a
−b± 
b 
2
 −4ac
​
 
​
  for solving equations.

Block math
Use double dollar signs $$...$$ on separate lines for block math formulas that appear as standalone, centered equations.

Block math example

$$
\int_{a}^{b} f(x) \, dx = F(b) - F(a)
$$
∫
a
b
f
(
x
)
 
d
x
=
F
(
b
)
−
F
(
a
)
∫ 
a
b
​
 f(x)dx=F(b)−F(a)
