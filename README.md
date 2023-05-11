# Octree

Octree is a data structure used for spatial partitioning, which can be used to efficiently locate nearby points in 3D space. This implementation of Octree is written in JavaScript and can be used in various applications that require spatial indexing of points.

## demo

https://octree-es.i.cnbbx.com/demo/main.html

https://octree-es.i.cnbbx.com/demo/demo.html

https://octree-es.i.cnbbx.com/demo/joinBoxGeometry.html

https://octree-es.i.cnbbx.com/demo/joinGltf.html

https://octree-es.i.cnbbx.com/demo/joinsphereGeometry.html

https://octree-es.i.cnbbx.com/demo/test.html

## Usage

### Creating an Octree

To create an Octree, you need to provide the position and size of the root cell. You can also specify the `accuracy` parameter, which determines the minimum distance between points in the octree. The default value of `accuracy` is 0.

```javascript
import Octree from "./octree.js";
import Vec3 from "./vec3.js";

const origin = Vec3.create(0, 0, 0);
const size = Vec3.create(100, 100, 100);

const octree = new Octree(origin, size);
```

### Adding Points

You can add points to the Octree using the `add` method. The second argument to this method is optional and can be used to associate some data with the point.

```javascript
const point = Vec3.create(10, 20, 30);
const data = { name: "Point A" };

octree.add(point, data);
```

### Finding Points

You can use the `has` method to check whether a point exists in the Octree or not. If a point exists, the method returns its associated data; otherwise, it returns false.

```javascript
const point = Vec3.create(10, 20, 30);

if (octree.has(point)) {
  console.log("The point exists in the octree");
} else {
  console.log("The point does not exist in the octree");
}
```

You can also find the nearest point to a given point in the Octree using the `findNearestPoint` method. By default, this method returns only the nearest point. You can also specify the `includeData` option to include the associated data of the nearest point.

```javascript
const point = Vec3.create(10, 20, 30);

const nearestPoint = octree.findNearestPoint(point);
if (nearestPoint) {
  console.log("The nearest point is:", nearestPoint);
}
```

You can further restrict the search radius and exclude the given point using the `maxDist` and `notSelf` options.

```javascript
const point = Vec3.create(10, 20, 30);

const options = { maxDist: 50, notSelf: true };
const nearestPoint = octree.findNearestPoint(point, options);

if (nearestPoint) {
  console.log("The nearest point within 50 units is:", nearestPoint);
}
```

To find all points within a given radius, you can use the `findNearbyPoints` method.

```javascript
const point = Vec3.create(10, 20, 30);
const radius = 50;

const results = octree.findNearbyPoints(point, radius);

if (results.points.length > 0) {
  console.log(
    "Found",
    results.points.length,
    "points within",
    radius,
    "units."
  );
}
```

### Cell Operations

You can traverse all cells at a certain level using the `getAllCellsAtLevel` method. By default, this method starts with the root cell and returns all cells at the specified level that contain one or more points.

```javascript
const level = 3;
const cells = octree.getAllCellsAtLevel(level);

console.log("Found", cells.length, "cells at level", level);
```

## Conclusion

Octree is a simple yet powerful data structure for spatial indexing of points in 3D space. This implementation of Octree in JavaScript can be used in various applications that require fast and efficient lookup of nearby points.

# Vec3 Class

The `Vec3` class is a JavaScript implementation of a 3D vector that provides various operations for manipulating and calculating vectors in 3D space.

## Usage

### Creating Vectors

To create a new vector, you can use the constructor or the static `create` method:

```javascript
import Vec3 from "./Vec3.js";

const v1 = new Vec3(1, 2, 3);
const v2 = Vec3.create(4, 5, 6);
```

### Vector Operations

The `Vec3` class provides various operations for manipulating vectors. Here are some examples:

#### Addition and Subtraction

```javascript
const v1 = Vec3.create(1, 2, 3);
const v2 = Vec3.create(4, 5, 6);

const result1 = v1.clone().add(v2); // result1: {x: 5, y: 7, z: 9}
const result2 = v1.clone().subtract(v2); // result2: {x: -3, y: -3, z: -3}
```

#### Scaling

```javascript
const v = Vec3.create(1, 2, 3);

const result1 = v.clone().multiplyScalar(2); // result1: {x: 2, y: 4, z: 6}
const result2 = v.clone().divideScalar(2); // result2: {x: 0.5, y: 1, z: 1.5}
```

#### Dot Product and Cross Product

```javascript
const v1 = Vec3.create(1, 2, 3);
const v2 = Vec3.create(4, 5, 6);

const dotProduct = v1.dot(v2); // dotProduct: 32
const crossProduct = v1.clone().cross(v2); // crossProduct: {x: -3, y: 6, z: -3}
```

#### Length and Normalization

```javascript
const v = Vec3.create(1, 2, 3);

const length = v.length(); // length: 3.7416573867739413
const normalizedVector = v.clone().normalize(); // normalizedVector: {x: 0.2672612419124244, y: 0.5345224838248488, z: 0.8017837257372732}
```

### Other Operations

The `Vec3` class also provides other operations such as `set`, `copy`, `equals`, `negate`, `lerp`, etc. You can refer to the source code for more information.

## Conclusion

The `Vec3` class provides a powerful and flexible way of working with 3D vectors in JavaScript. Its simple interface makes it easy to use in various applications that require vector calculations in 3D space.
