const tasks = (root, args, context, info) => {
  return context.db.query.tasks({}, info);
};

module.exports = {
  tasks
};
