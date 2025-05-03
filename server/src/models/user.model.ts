import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';

// User interface based on shared types
interface UserAttributes {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  goal?: string;
  industry?: string;
  experience?: string;
  workType?: string;
  profileCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new User, id and timestamps are optional
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'profileCompleted'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public firstName!: string;
  public lastName!: string;
  public passwordHash!: string;
  public goal?: string;
  public industry?: string;
  public experience?: string;
  public workType?: string;
  public profileCompleted!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to check password
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.passwordHash);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    goal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    experience: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    workType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profileCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'users',
    sequelize,
    timestamps: true,
    hooks: {
      // Hash password before creating
      beforeCreate: async (user: User) => {
        if (user.passwordHash) {
          const saltRounds = 10;
          user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
        }
      },
      // Only hash the password if it's changed
      beforeUpdate: async (user: User) => {
        if (user.changed('passwordHash')) {
          const saltRounds = 10;
          user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
        }
      },
    },
  }
);

export { User }; 