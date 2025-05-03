import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';

// Career path node interface
interface CareerPathNodeAttributes {
  id: string;
  userId: string;
  title: string;
  level: string;
  description: string;
  skills: string[];
  salaryRange?: string;
  timeToAchieve?: string;
  prerequisites?: string[];
  nextSteps?: string[];
  resources?: string[];
  isCurrentPosition: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new CareerPathNode, id and timestamps are optional
interface CareerPathNodeCreationAttributes extends Optional<CareerPathNodeAttributes, 'id' | 'createdAt' | 'updatedAt' | 'salaryRange' | 'timeToAchieve' | 'prerequisites' | 'nextSteps' | 'resources'> {}

class CareerPathNode extends Model<CareerPathNodeAttributes, CareerPathNodeCreationAttributes> implements CareerPathNodeAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public level!: string;
  public description!: string;
  public skills!: string[];
  public salaryRange?: string;
  public timeToAchieve?: string;
  public prerequisites?: string[];
  public nextSteps?: string[];
  public resources?: string[];
  public isCurrentPosition!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CareerPathNode.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    salaryRange: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timeToAchieve: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prerequisites: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    nextSteps: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    resources: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    isCurrentPosition: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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
    tableName: 'career_path_nodes',
    sequelize,
    timestamps: true,
  }
);

// Career path connection (edges between nodes)
interface CareerPathConnectionAttributes {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: 'NEXT_ROLE' | 'ALTERNATIVE' | 'PREREQUISITE';
  probability?: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CareerPathConnectionCreationAttributes extends Optional<CareerPathConnectionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'probability' | 'description'> {}

class CareerPathConnection extends Model<CareerPathConnectionAttributes, CareerPathConnectionCreationAttributes> implements CareerPathConnectionAttributes {
  public id!: string;
  public sourceNodeId!: string;
  public targetNodeId!: string;
  public type!: 'NEXT_ROLE' | 'ALTERNATIVE' | 'PREREQUISITE';
  public probability?: number;
  public description?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CareerPathConnection.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sourceNodeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'career_path_nodes',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    targetNodeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'career_path_nodes',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM('NEXT_ROLE', 'ALTERNATIVE', 'PREREQUISITE'),
      allowNull: false,
    },
    probability: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
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
    tableName: 'career_path_connections',
    sequelize,
    timestamps: true,
  }
);

// Note: Associations are defined in the models/index.ts file to avoid duplication

export { CareerPathNode, CareerPathConnection }; 