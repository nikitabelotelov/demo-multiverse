function getIntersect(intersects, object) {
  return intersects.find((el) => el.object === object);
}

export { getIntersect };
