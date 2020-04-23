export function combineConsecutives(nums: number[], options: {
    combineWithLengthSameOrMoreThan: number,
}) {
    const { combineWithLengthSameOrMoreThan } = options;
    const sortedNums = [...nums].sort((a, b) => a - b)

    let curNum = sortedNums[0]
    const outputIntermediate: number[][] = [[curNum]]
    
    sortedNums.forEach((num, idx) => {
        if (idx > 0) {
            const curNode = outputIntermediate[outputIntermediate.length - 1]
            if (num === curNode[curNode.length - 1] + 1) {
                curNode.push(num)
            } else {
                outputIntermediate.push([num])
            }
        }
    })

    return outputIntermediate.reduce((arr, el) => {
        if (el.length === 1) {
            arr.push(...el)
        } else if (el.length >= combineWithLengthSameOrMoreThan) {
            arr.push([el[0], el[el.length - 1]])
        } else {
            arr.push(...el)
        }
        return arr
    }, [] as Array<number | number[]>)
}

export function groupWithConsecutivesConmined(
    nums: number[],
    options: {
        combineWithLengthSameOrMoreThan: number,
        consecutiveSpaceOccupation: number,
        numberPerGroup: number,
    },
) {
    const {
        combineWithLengthSameOrMoreThan,
        consecutiveSpaceOccupation,
        numberPerGroup,
    } = options
    const numsWConsecutives = combineConsecutives(nums, {combineWithLengthSameOrMoreThan})

    const numsWConsecutivesSpaceAdded = numsWConsecutives.reduce((arr, el) => {
        if (Array.isArray(el) && consecutiveSpaceOccupation > 1) {
            const newLen = arr.length + consecutiveSpaceOccupation
            if (newLen % numberPerGroup === 0) {
                arr.push(el, ...Array(consecutiveSpaceOccupation - 1).fill(null))
            } else {
                arr.push(...Array(consecutiveSpaceOccupation - 1).fill(null), el)
                if (arr.length  % numberPerGroup === 1) {
                    arr.push(...Array(consecutiveSpaceOccupation - 1))
                }
            }
        } else {
            arr.push(el)
        }

        return arr
    }, [] as Array<number | number[] | null>)

    return numsWConsecutivesSpaceAdded
        .reduce((arr, p, idx) => {
            const gIdx = Math.floor(idx / numberPerGroup)
            if (!arr[gIdx]) {
                arr[gIdx] = []
            }
            arr[gIdx].push(p)
            return arr
        }, [] as Array<Array<number | number[] | null>>)
        .map((el) => {
            return el.filter(e => Array.isArray(e) || typeof e === 'number') as Array<number | number[]>
        }) 
}