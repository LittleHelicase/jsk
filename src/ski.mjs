
export const instructions =
{
    I: x => x,
    T: (a, b) => a,
    F: (a, b) => b,
    S: (f, g, x) => [f, x, [g, x]],
    B: (f, g, x) => [f, [g, x]],
    C: (f, x, y) => [f, y, x],
}
