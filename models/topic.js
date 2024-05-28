module.exports = (sequelize, DataTypes) => {
  const Topic = sequelize.define('Topic', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'topics',
    timestamps: false
  });

  Topic.associate = (models) => {
    Topic.hasMany(models.Conference, { foreignKey: 'topic_id' });
  };

  return Topic;
};
