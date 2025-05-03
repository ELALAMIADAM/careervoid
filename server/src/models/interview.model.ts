import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';
import { Application } from './application.model';

// Interview types
enum InterviewTypeEnum {
  PHONE_SCREENING = 'PHONE_SCREENING',
  TECHNICAL = 'TECHNICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  SYSTEM_DESIGN = 'SYSTEM_DESIGN',
  CASE_STUDY = 'CASE_STUDY',
  CULTURE_FIT = 'CULTURE_FIT',
  FINAL_ROUND = 'FINAL_ROUND'
}

// Interview preparation interface
interface InterviewPrepAttributes {
  id: string;
  userId: string;
  applicationId?: string;
  interviewType: InterviewTypeEnum;
  jobTitle: string;
  companyName: string;
  scheduledDate?: Date;
  questions: InterviewQuestion[];
  notes?: string;
  aiSuggestions?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interview question interface
interface InterviewQuestion {
  question: string;
  suggestedAnswer?: string;
  userAnswer?: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

// For creating a new InterviewPrep, id and timestamps are optional
interface InterviewPrepCreationAttributes extends Optional<InterviewPrepAttributes, 'id' | 'createdAt' | 'updatedAt' | 'applicationId' | 'scheduledDate' | 'notes' | 'aiSuggestions'> {}

class InterviewPrep extends Model<InterviewPrepAttributes, InterviewPrepCreationAttributes> implements InterviewPrepAttributes {
  public id!: string;
  public userId!: string;
  public applicationId?: string;
  public interviewType!: InterviewTypeEnum;
  public jobTitle!: string;
  public companyName!: string;
  public scheduledDate?: Date;
  public questions!: InterviewQuestion[];
  public notes?: string;
  public aiSuggestions?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InterviewPrep.init(
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
    applicationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'applications',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    interviewType: {
      type: DataTypes.ENUM(...Object.values(InterviewTypeEnum)),
      allowNull: false,
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    questions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    aiSuggestions: {
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
    tableName: 'interview_preps',
    sequelize,
    timestamps: true,
  }
);

// Set up associations
InterviewPrep.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(InterviewPrep, { foreignKey: 'userId', as: 'interviewPreps' });

InterviewPrep.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });
Application.hasMany(InterviewPrep, { foreignKey: 'applicationId', as: 'interviewPreps' });

// Export the enum as InterviewType to maintain compatibility with existing code
export { InterviewPrep };
export { InterviewTypeEnum as InterviewType };
export type { InterviewQuestion }; 