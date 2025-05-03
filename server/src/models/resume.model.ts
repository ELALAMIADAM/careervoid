import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';

// Resume interface based on shared types
interface ResumeAttributes {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileUrl: string;
  content: string;
  plainText: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  languages?: string[];
  projects?: ResumeProject[];
  about?: string;
  contactInfo?: ContactInfo;
  isPrimary: boolean;
  vectorEmbedding?: Buffer; // For vector search
  createdAt?: Date;
  updatedAt?: Date;
}

interface ResumeExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface ResumeEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
}

interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

interface ContactInfo {
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  address?: string;
}

// For creating a new Resume, id and timestamps are optional
interface ResumeCreationAttributes extends Optional<ResumeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Resume extends Model<ResumeAttributes, ResumeCreationAttributes> implements ResumeAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public fileName!: string;
  public fileUrl!: string;
  public content!: string;
  public plainText!: string;
  public skills!: string[];
  public experience!: ResumeExperience[];
  public education!: ResumeEducation[];
  public languages?: string[];
  public projects?: ResumeProject[];
  public about?: string;
  public contactInfo?: ContactInfo;
  public isPrimary!: boolean;
  public vectorEmbedding?: Buffer;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Resume.init(
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
      defaultValue: 'Resume',
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    plainText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    experience: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    education: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    languages: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    projects: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contactInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'resumes',
    sequelize,
    timestamps: true,
  }
);

// Set up associations
Resume.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Resume, { foreignKey: 'userId', as: 'resumes' });

export { Resume };
export type { ResumeExperience, ResumeEducation, ResumeProject, ContactInfo }; 