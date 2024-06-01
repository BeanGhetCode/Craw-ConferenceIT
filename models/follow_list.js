module.exports = (sequelize, DataTypes) => {
  const FollowList = sequelize.define('FollowList', {
    id_conference: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'conferences',
        key: 'id'
      }
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'follow_list',
    timestamps: false
  });

  FollowList.associate = (models) => {
    FollowList.belongsTo(models.User, { foreignKey: 'id_user' });
    FollowList.belongsTo(models.Conference, { foreignKey: 'id_conference' });
  };

  return FollowList;
};
