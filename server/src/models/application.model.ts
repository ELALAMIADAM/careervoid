import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';
import { Job } from './job.model';
import { Resume } from './resume.model';
import { CoverLetter } from './coverLetter.model';

// Application status enum
enum ApplicationStatusEnum {
  APPLIED = 'APPLIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  OFFER_RECEIVED = 'OFFER_RECEIVED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  WITHDRAWN = 'WITHDRAWN'
}

// Application interface
interface ApplicationAttributes {
  id: string;
  userId: string;
  jobId: string;
  resumeId: string;
  coverLetterId?: string;
  status: ApplicationStatusEnum;
  notes?: string;
  interviewDate?: Date;
  offerAmount?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new Application, id and timestamps are optional
interface ApplicationCreationAttributes extends Optional<ApplicationAttributes, 'id' | 'createdAt' | 'updatedAt' | 'coverLetterId' | 'notes' | 'interviewDate' | 'offerAmount'> {}

class Application extends Model<ApplicationAttributes, ApplicationCreationAttributes> implements ApplicationAttributes {
  public id!: string;
  public userId!: string;
  public jobId!: string;
  public resumeId!: string;
  public coverLetterId?: string;
  public status!: ApplicationStatusEnum;
  public notes?: string;
  public interviewDate?: Date;
  public offerAmount?: string;

  // Associations
  public job?: Job;
  public resume?: Resume;
  public coverLetter?: CoverLetter;
  public user?: User;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Application.init(
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
    resumeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'resumes',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    coverLetterId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'cover_letters',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ApplicationStatusEnum)),
      allowNull: false,
      defaultValue: ApplicationStatusEnum.APPLIED,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    interviewDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    offerAmount: {
      type: DataTypes.STRING,
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
    tableName: 'applications',
    sequelize,
    timestamps: true,
  }
);

// Set up associations
Application.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Application, { foreignKey: 'userId', as: 'applications' });

Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });

Application.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });
Resume.hasMany(Application, { foreignKey: 'resumeId', as: 'applications' });

Application.belongsTo(CoverLetter, { foreignKey: 'coverLetterId', as: 'coverLetter' });
CoverLetter.hasMany(Application, { foreignKey: 'coverLetterId', as: 'applications' });

export { Application };
export { ApplicationStatusEnum as ApplicationStatus }; 