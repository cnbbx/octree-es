import Vec3 from "./vec3.js";

class Octree {
  constructor(position, size, accuracy = 0) {
    this.maxDistance = Math.max(size.x, size.y, size.z);
    this.accuracy = accuracy;
    this.root = new Cell(this, position, size, 0);
  }

  static fromBoundingBox(bbox) {
    return new Octree(bbox.min.clone(), bbox.getSize().clone());
  }

  add(p, data) {
    this.root.add(p, data);
  }

  has(p) {
    return this.root.has(p);
  }

  findNearestPoint(p, options = {}) {
    options.includeData = options.includeData ?? false;
    options.bestDist = options.maxDist ?? Infinity;
    options.notSelf = options.notSelf ?? false;

    const result = this.root.findNearestPoint(p, options);
    return result ? (options.includeData ? result : result.point) : null;
  }

  findNearbyPoints(p, r, options = {}) {
    const result = { points: [], data: [] };
    this.root.findNearbyPoints(p, r, result, options);
    return result;
  }

  getAllCellsAtLevel(cell, level, result = []) {
    if (level === undefined) {
      level = cell;
      cell = this.root;
    }
    if (cell.level === level && cell.points.length > 0) {
      result.push(cell);
    } else {
      for (const child of cell.children) {
        this.getAllCellsAtLevel(child, level, result);
      }
    }
    return result;
  }
}

Octree.MaxLevel = 8;

class Cell {
  constructor(tree, position, size, level) {
    this.tree = tree;
    this.position = position;
    this.size = size;
    this.level = level;
    this.points = [];
    this.data = [];
    this.children = [];
    this.temp = new Vec3();
  }

  squareDistanceToCenter = function (p) {
    var dx = p.x - (this.position.x + this.size.x / 2);
    var dy = p.y - (this.position.y + this.size.y / 2);
    var dz = p.z - (this.position.z + this.size.z / 2);
    return dx * dx + dy * dy + dz * dz;
  }

  has(p) {
    if (!this.contains(p)) return false;
    if (this.children.length > 0) {
      for (const child of this.children) {
        const duplicate = child.has(p);
        if (duplicate) {
          return duplicate;
        }
      }
      return false;
    } else {
      const minDistSqr = this.tree.accuracy ** 2;
      for (let i = 0; i < this.points.length; i++) {
        const o = this.points[i];
        const distSqr = p.squareDistance(o);
        if (distSqr <= minDistSqr) {
          return o;
        }
      }
      return false;
    }
  }

  add(p, data) {
    this.points.push(p);
    this.data.push(data);
    if (this.children.length > 0) {
      this.addToChildren(p, data);
    } else if (this.points.length > 1 && this.level < Octree.MaxLevel) {
      this.split();
    }
  }

  addToChildren(p, data) {
    for (const child of this.children) {
      if (child.contains(p)) {
        child.add(p, data);
        break;
      }
    }
  }

  contains(p) {
    const pMin = p.clone().subScalar(this.tree.accuracy);
    const pMax = p.clone().addScalar(this.tree.accuracy).add(this.size);
    return (
      p.x >= pMin.x &&
      p.y >= pMin.y &&
      p.z >= pMin.z &&
      p.x < pMax.x &&
      p.y < pMax.y &&
      p.z < pMax.z
    );
  }

  split() {
    const x = this.position.x;
    const y = this.position.y;
    const z = this.position.z;
    const w2 = this.size.x / 2;
    const h2 = this.size.y / 2;
    const d2 = this.size.z / 2;

    this.children.push(
      new Cell(this.tree, Vec3.create(x, y, z), Vec3.create(w2, h2, d2), this.level + 1),
      new Cell(this.tree, Vec3.create(x + w2, y, z), Vec3.create(w2, h2, d2), this.level + 1),
      new Cell(this.tree, Vec3.create(x, y + h2, z), Vec3.create(w2, h2, d2), this.level + 1),
      new Cell(this.tree, Vec3.create(x, y, z + d2), Vec3.create(w2, h2, d2), this.level + 1),
      new Cell(this.tree, Vec3.create(x + w2, y + h2, z), Vec3.create(w2, h2, d2), this.level + 1),
      new Cell(this.tree, Vec3.create(x, y + h2, z + d2), Vec3.create(w2, h2, d2), this.level + 1),
      new Cell(this.tree, Vec3.create(x + w2, y, z + d2), Vec3.create(w2, h2, d2), this.level + 1),
      new Cell(this.tree, Vec3.create(x + w2, y + h2, z + d2), Vec3.create(w2, h2, d2), this.level + 1)
    );

    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const data = this.data[i];
      this.addToChildren(p, data);
    }

    this.points.length = 0;
    this.data.length = 0;
  }

  findNearestPoint(p, options) {
    if (!this.contains(p)) return null;

    let result = null;
    let bestDistSqr = options.bestDist ** 2;
    for (const point of this.points) {
      const distSqr = p.squareDistance(point);
      if ((distSqr < bestDistSqr) && (!(options.notSelf && p.equals(point)))) {
        result = { point: point };
        bestDistSqr = distSqr;
      }
    }
    if (this.children.length > 0) {
      for (const child of this.children) {
        const childResult = child.findNearestPoint(p, options);
        if (childResult) {
          const distSqr = p.squareDistance(childResult.point);
          if (distSqr < bestDistSqr) {
            result = childResult;
            bestDistSqr = distSqr;
          }
        }
      }
    }
    return result;
  }

  findNearbyPoints(p, r, result, options) {
    if (p.distance(this.position.add(this.size.clone().multiplyScalar(0.5))) > r + this.tree.maxDistance) {
      return;
    }

    if (this.children.length === 0) {
      for (let i = 0; i < this.points.length; i++) {
        const point = this.points[i];
        const data = this.data[i];
        const dist = point.distance(p);
        if (dist <= r) {
          result.points.push(point);
          result.data.push(data);
        }
      }
    } else {
      for (const child of this.children) {
        child.findNearbyPoints(p, r, result, options);
      }
    }
  }
}

export default Octree;
export { Octree, Vec3 };