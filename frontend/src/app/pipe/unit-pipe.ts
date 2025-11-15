import {Pipe, PipeTransform} from '@angular/core';


enum Unit {
  B,
  KB,
  MB,
  GB,
  TB,
  PB
}

@Pipe({
  name: 'unit'
})
export class UnitPipe implements PipeTransform {

  transform(input: number): string {
    if (!input || input == 0) {
      return '';
    }

    let unitIndex = Object.keys(Unit)
      .map(key => {
        let number = Number(key);
        if (isNaN(number)) return undefined
        return number;
      })
      .filter(number => number !== undefined)
      .find(unitIndex => input < this.toBytes(unitIndex));

    if (unitIndex !== undefined) {
      let clampedIndex = Math.max(0, unitIndex - 1);
      let bytes = input/this.toBytes(clampedIndex);
      return `${bytes.toFixed(2).replace(/\.?0+$/, "")} ${Unit[clampedIndex]}`;
    }

    return `${input.toString().replace(/\.?0+$/, "")} ${Unit.B}`;
  }

  private toBytes(unitIndex: number): number {
    return 1 << (unitIndex * 10);
  }
}
