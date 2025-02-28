export class Coord {
  constructor(public x: number, public y: number) {}
  public add(coord: Coord): Coord {
    return new Coord(this.x + coord.x, this.y + coord.y);
  }

  public subtract(coord: Coord): Coord {
    return new Coord(this.x - coord.x, this.y - coord.y);
  }
}

export const isEqualCoord = (a: Coord, b: Coord) => a.x === b.x && a.y === b.y;
