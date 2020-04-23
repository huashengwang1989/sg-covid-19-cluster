export default function prefixZero(n: number): string {
    return n < 10 ? `000${n}` : n < 100 ? `00${n}` : n < 1000 ? `0${n}` : `${n}`
}