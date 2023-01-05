// interface FuncA {
//     (a: number, b: number): number;
//     (a: string, b: string): string;
// }
// const sum1: FuncA = (a, b) => {
//     if (typeof a === 'number') {
//         return a + b;
//     }
// }

function add(a: number, b: number): number;
function add(a: string, b: string): string;
function add(a: any, b: any): any {
    if (typeof a === 'number') {
        return a + b;
    } else {
        a;
    }
}

add(1, 2);

// const sum1: FuncA = (a, b) => a + b;
