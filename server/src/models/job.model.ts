import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// Job interface based on shared types
interface JobAttributes {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  salary?: string;
  vectorEmbedding?: Buffer; // For vector search
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new Job, id and timestamps are optional
interface JobCreationAttributes extends Optional<JobAttributes, 'id' | 'createdAt' | 'updatedAt' | 'salary' | 'vectorEmbedding'> {}

class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  public id!: string;
  public title!: string;
  public company!: string;
  public location!: string;
  public description!: string;
  public requirements!: string;
  public type!: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  public salary?: string;
  public vectorEmbedding?: Buffer;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Job.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE'),
      allowNull: false,
    },
    salary: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vectorEmbedding: {
      type: DataTypes.BLOB,
      allowNull: true,
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
    tableName: 'jobs',
    sequelize,
    timestamps: true,
  }
);

export { Job }; 