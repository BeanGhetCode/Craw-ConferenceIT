module.exports = (sequelize, DataTypes) => {
  const Conference = sequelize.define('Conference', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    topic_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Topics',
        key: 'id'
      }
    }
  }, {
    tableName: 'conferences',
    timestamps: false
  });

  Conference.associate = (models) => {
    Conference.belongsTo(models.Topic, { foreignKey: 'id' });
    Conference.hasMany(models.FollowList, { foreignKey: 'id' });
  };

  return Conference;
};
