const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');  //To hash passwords
require('dotenv').config();  //To access environment variables 


const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
);

module.exports = sequelize;


const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

module.exports = User;


const Post = sequelize.define('Post', {
  title: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false }
});

Post.belongsTo(User, { as: 'author' });
User.hasMany(Post, { as: 'posts' });

module.exports = Post;


const Comment = sequelize.define('Comment', {
  body: { type: DataTypes.TEXT, allowNull: false }
});

Comment.belongsTo(User, { as: 'author' });
User.hasMany(Comment, { as: 'comments' });
Comment.belongsTo(Post);
Post.hasMany(Comment, { as: 'comments' });

module.exports = Comment;
