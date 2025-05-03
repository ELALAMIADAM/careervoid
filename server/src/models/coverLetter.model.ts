import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';
import { Job } from './job.model';

// CoverLetter interface based on shared types
interface CoverLetterAttributes {
  id: string;
  userId: string;
  jobId: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new CoverLetter, id and timestamps are optional
interface CoverLetterCreationAttributes extends Optional<CoverLetterAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class CoverLetter extends Model<CoverLetterAttributes, CoverLetterCreationAttributes> implements CoverLetterAttributes {
  public id!: string;
  public userId!: string;
  public jobId!: string;
  public content!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CoverLetter.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'jobs',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: 'cover_letters',
    sequelize,
    timestamps: true,
  }
);

// Set up associations
CoverLetter.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(CoverLetter, { foreignKey: 'userId', as: 'coverLetters' });

CoverLetter.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(CoverLetter, { foreignKey: 'jobId', as: 'coverLetters' });

export { CoverLetter }; 